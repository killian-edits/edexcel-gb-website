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

    // Insert subject
    const { data: subject, error: subjectError } = await adminClient
      .from("subjects")
      .insert({
        code: normalizedCode,
        title: normalizedTitle,
        qualification: input.qualification.trim() || "International GCSE",
        version: input.version.trim() || "2017",
        tiers: normalizedTiers,
        status: input.status || "verified",
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
