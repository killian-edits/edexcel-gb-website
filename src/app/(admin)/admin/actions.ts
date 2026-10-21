"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createAdminSupabaseClient,
} from "@/lib/supabase/server";

export interface RegisterSubjectInput {
  code: string;
  title: string;
  qualification: string;
  version: string;
  tiers: string[] | null;
  status: "verified" | "unverified" | "draft" | "retired";
  sourceUrl?: string | null;
  sourceNotes?: string | null;
  components?: Array<{
    componentCode: string;
    componentName: string;
    maxRawMarks: number;
    duration?: string | null;
    weightingPercent?: number | null;
  }>;
}

export interface AddBoundaryInput {
  subjectId: string;
  series: string;
  year: number;
  tier: string | null;
  variant: string | null;
  componentCode: string | null;
  maxMark: number;
  thresholds: Record<string, number>;
  source: string;
  publicationDate?: string | null;
  verificationStatus: "verified" | "unverified" | "draft" | "retired";
}

/**
 * Verify admin session before executing mutations
 */
async function verifyAdmin() {
  const userClient = await createServerSupabaseClient();
  if (!userClient) {
    throw new Error("Supabase client unavailable");
  }

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin privilege required");
  }

  return user;
}

export async function registerSubjectAction(input: RegisterSubjectInput) {
  try {
    await verifyAdmin();

    const adminClient = await createAdminSupabaseClient();
    if (!adminClient) {
      throw new Error("Admin database client unavailable");
    }

    const normalizedCode = input.code.trim().toUpperCase();
    const normalizedTitle = input.title.trim();
    const normalizedTiers =
      input.tiers && input.tiers.length > 0
        ? input.tiers.map((t) => t.toLowerCase())
        : null;

    // Check for existing subject with same code and version
    const { data: existing, error: existErr } = await adminClient
      .from('subjects')
      .select('id')
      .eq('code', normalizedCode)
      .eq('version', input.version.trim() || '2017')
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Subject with this code and version already exists.' };
    }

    // Insert subject
    const { data: subject, error: subjectError } = await adminClient
      .from('subjects')
      .insert({
        code: normalizedCode,
        title: normalizedTitle,
        qualification: input.qualification.trim() || 'International GCSE',
        version: input.version.trim() || '2017',
        tiers: normalizedTiers,
        status: input.status || 'verified',
        source_url: input.sourceUrl?.trim() || null,
      })
      .select()
      .single();

    if (subjectError) {
      return { success: false, error: subjectError.message };
    }

    // Insert any initial components
    if (input.components && input.components.length > 0 && subject) {
      const componentsToInsert = input.components.map((c, idx) => ({
        subject_id: subject.id,
        component_code: c.componentCode.trim().toUpperCase(),
        component_name: c.componentName.trim(),
        max_raw_marks: Number(c.maxRawMarks),
        duration: c.duration?.trim() || null,
        weighting_percent:
          c.weightingPercent !== undefined && c.weightingPercent !== null
            ? Number(c.weightingPercent)
            : null,
        scaling_factor: null,
        sort_order: idx + 1,
        status: "verified",
      }));

      const { error: compsError } = await adminClient
        .from("subject_components")
        .insert(componentsToInsert);

      if (compsError) {
        console.warn(
          "Could not insert components during subject registration:",
          compsError,
        );
      }
    }

    revalidatePath("/admin/subjects");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, data: subject };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to register subject",
    };
  }
}

export async function addBoundaryDatasetAction(input: AddBoundaryInput) {
  try {
    await verifyAdmin();

    const adminClient = await createAdminSupabaseClient();
    if (!adminClient) {
      throw new Error("Admin database client unavailable");
    }

    const seriesName = input.series.trim();
    const seriesType = seriesName.toLowerCase();
    const normalizedTier = input.tier ? input.tier.trim().toLowerCase() : null;

    // Filter thresholds for 9-1 and U numeric keys
    const cleanThresholds: Record<string, number> = {};
    for (const [key, val] of Object.entries(input.thresholds)) {
      if (typeof val === "number" && !isNaN(val)) {
        cleanThresholds[key] = val;
      }
    }

    if (!cleanThresholds["U"]) {
      cleanThresholds["U"] = 0;
    }

    const { data: boundary, error: boundaryError } = await adminClient
      .from("grade_boundaries")
      .insert({
        subject_id: input.subjectId,
        series: seriesName.charAt(0).toUpperCase() + seriesName.slice(1),
        series_type: seriesType,
        year: Number(input.year),
        tier: normalizedTier,
        variant: input.variant ? input.variant.trim().toUpperCase() : null,
        component_code: input.componentCode ? input.componentCode.trim() : null,
        max_mark: Number(input.maxMark),
        thresholds: cleanThresholds,
        source: input.source.trim() || "Verified Pearson Edexcel Publication",
        publication_date: input.publicationDate || null,
        verification_status: input.verificationStatus || "verified",
        data_version: 1,
      })
      .select()
      .single();

    if (boundaryError) {
      return { success: false, error: boundaryError.message };
    }

    revalidatePath("/admin/boundaries");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/subjects/${input.subjectId}`);
    return { success: true, data: boundary };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to add grade boundary dataset",
    };
  }
}

/**
 * Candidate Action: Save chosen subject codes to profile
 * Restricts saving only to verified subjects found in Supabase.
 */
export async function saveCandidateSubjectsAction(subjectCodes: string[]) {
  try {
    const userClient = await createServerSupabaseClient();
    if (!userClient) {
      throw new Error("Supabase client unavailable");
    }

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required to save subjects");
    }

    // Verify all subjectCodes are in the supported subjects in Supabase
    const { data: verifiedSubjects, error: subjectsError } = await userClient
      .from("subjects")
      .select("code")
      .eq("status", "verified");

    if (subjectsError) {
      throw new Error("Failed to verify subjects against database");
    }

    const verifiedCodesSet = new Set((verifiedSubjects || []).map((s) => s.code.toUpperCase()));
    const validCodesToSave = subjectCodes
      .map((c) => c.trim().toUpperCase())
      .filter((c) => verifiedCodesSet.has(c));

    // Deduplicate
    const finalCodes = Array.from(new Set(validCodesToSave));

    const { error: updateError } = await userClient
      .from("profiles")
      .update({
        chosen_subjects: finalCodes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(updateError.message || "Failed to update profile subjects");
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, chosenSubjects: finalCodes };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to save chosen subjects",
    };
  }
}
