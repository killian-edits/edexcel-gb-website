/**
 * Async Supabase queries for subjects, components, grade boundaries, and resources.
 * Directly communicates with Supabase PostgreSQL tables.
 *
 * Uses createStaticSupabaseClient() for public, static, and build-time queries
 * (e.g., generateStaticParams, public page rendering) to avoid next/headers cookies() errors.
 */

import { createStaticSupabaseClient } from "@/lib/supabase/server";
import type {
  Subject,
  SubjectComponent,
  GradeBoundary,
  Resource,
  Tier,
  VerificationStatus,
  SeriesType,
  GradeThresholds,
} from "@/types";

interface SubjectRow {
  id: string;
  code: string;
  version: string;
  title: string;
  qualification: string;
  tiers: string[] | null;
  status: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ComponentRow {
  id: string;
  subject_id: string;
  component_code: string;
  component_name: string;
  max_raw_marks: number;
  duration: string | null;
  weighting_percent: number | string | null;
  scaling_factor: number | string | null;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GradeBoundaryRow {
  id: string;
  subject_id: string;
  series: string;
  series_type: string;
  year: number;
  tier: string | null;
  variant: string | null;
  component_code: string | null;
  thresholds: Record<string, number>;
  max_mark: number;
  source: string;
  publication_date: string | null;
  verification_status: string;
  data_version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ResourceRow {
  id: string;
  title: string;
  description: string;
  subject_code: string | null;
  url: string;
  attribution: string | null;
  resource_type: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

function mapSubjectRow(row: SubjectRow): Subject {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    qualification: row.qualification,
    version: row.version,
    tiers: row.tiers ? row.tiers.map((t) => t.toLowerCase() as Tier) : null,
    status: (row.status as VerificationStatus) ?? "verified",
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapComponentRow(row: ComponentRow): SubjectComponent {
  return {
    id: row.id,
    subjectId: row.subject_id,
    componentCode: row.component_code,
    componentName: row.component_name,
    maxRawMarks: Number(row.max_raw_marks),
    duration: row.duration,
    weightingPercent:
      row.weighting_percent !== null ? Number(row.weighting_percent) : null,
    scalingFactor:
      row.scaling_factor !== null ? Number(row.scaling_factor) : null,
    sortOrder: Number(row.sort_order),
    status: (row.status as VerificationStatus) ?? "verified",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBoundaryRow(row: GradeBoundaryRow): GradeBoundary {
  return {
    id: row.id,
    subjectId: row.subject_id,
    series: row.series,
    seriesType: row.series_type as SeriesType,
    year: Number(row.year),
    tier: (row.tier as Tier | null) ?? null,
    variant: row.variant,
    componentCode: row.component_code,
    thresholds: row.thresholds as GradeThresholds,
    maxMark: Number(row.max_mark),
    source: row.source,
    publicationDate: row.publication_date,
    verificationStatus:
      (row.verification_status as VerificationStatus) ?? "verified",
    dataVersion: Number(row.data_version ?? 1),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapResourceRow(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subjectCode: row.subject_code,
    url: row.url,
    attribution: row.attribution,
    resourceType: row.resource_type as Resource["resourceType"],
    isVerified: Boolean(row.is_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("code", { ascending: true });

  if (error || !data) return [];
  return (data as SubjectRow[]).map(mapSubjectRow);
}

export async function getSubjectByCode(code: string): Promise<Subject | null> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .ilike("code", code)
    .single();

  if (error || !data) return null;
  return mapSubjectRow(data as SubjectRow);
}

export async function searchSubjects(query: string): Promise<Subject[]> {
  const normalized = query.trim();
  if (!normalized) return [];

  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .or(
      `code.ilike.%${normalized}%,title.ilike.%${normalized}%,qualification.ilike.%${normalized}%`,
    )
    .order("code", { ascending: true });

  if (error || !data) return [];
  return (data as SubjectRow[]).map(mapSubjectRow);
}

export async function getComponentsForSubject(
  subjectId: string,
  tier?: string | null,
): Promise<SubjectComponent[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subject_components")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  const components = (data as ComponentRow[]).map(mapComponentRow);

  if (tier === "higher") {
    return components.filter(
      (c) => c.componentCode.endsWith("H") || !c.componentCode.match(/[HF]$/),
    );
  }
  if (tier === "foundation") {
    return components.filter(
      (c) => c.componentCode.endsWith("F") || !c.componentCode.match(/[HF]$/),
    );
  }

  return components;
}

export async function getAllComponents(): Promise<SubjectComponent[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("subject_components")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return (data as ComponentRow[]).map(mapComponentRow);
}

export async function getAllBoundaries(): Promise<GradeBoundary[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("grade_boundaries")
    .select("*")
    .order("year", { ascending: false });

  if (error || !data) return [];
  return (data as GradeBoundaryRow[]).map(mapBoundaryRow);
}

export async function getBoundariesForSubject(
  subjectId: string,
  tier?: string | null,
): Promise<GradeBoundary[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("grade_boundaries")
    .select("*")
    .eq("subject_id", subjectId)
    .order("year", { ascending: false });

  if (tier !== undefined) {
    if (tier === null) {
      query = query.is("tier", null);
    } else {
      query = query.eq("tier", tier);
    }
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as GradeBoundaryRow[]).map(mapBoundaryRow);
}

export async function getBoundary(
  subjectId: string,
  series: string,
  tier?: string | null,
): Promise<GradeBoundary | null> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return null;

  let query = supabase
    .from("grade_boundaries")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("series", series);

  if (tier !== undefined) {
    if (tier === null) {
      query = query.is("tier", null);
    } else {
      query = query.eq("tier", tier);
    }
  }

  const { data, error } = await query.single();
  if (error || !data) return null;
  return mapBoundaryRow(data as GradeBoundaryRow);
}

export async function getAvailableSeries(
  subjectId: string,
  tier?: string | null,
): Promise<string[]> {
  const boundaries = await getBoundariesForSubject(subjectId, tier);
  const sorted = [...boundaries].sort((a, b) => (b.year || 0) - (a.year || 0));
  const seriesWithYears = sorted.map((b) =>
    b.year && !b.series.includes(String(b.year))
      ? `${b.series} ${b.year}`
      : b.series,
  );
  return [...new Set(seriesWithYears)];
}

/**
 * Fetch revision resources and syllabus guides.
 * Queries Supabase 'resources' table if available.
 * If the table does not exist or has no rows, generates official resources directly
 * from verified subjects in the Supabase database.
 */
export async function getResources(): Promise<Resource[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  // 1. Try querying 'resources' table
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return (data as ResourceRow[]).map(mapResourceRow);
    }
  } catch {
    // Fall back to generating resources from active Supabase subjects
  }

  // 2. Fetch only the active subjects stored in Supabase
  const subjects = await getAllSubjects();
  return subjects
    .filter((s) => s.sourceUrl)
    .map((s) => ({
      id: `res-${s.code.toLowerCase()}-spec`,
      title: `Pearson Edexcel ${s.qualification} ${s.title} (${s.version} Specification)`,
      subjectCode: s.code,
      type: "specification" as const,
      description: `Official Pearson syllabus, exam format definitions, and component weighting structure for ${s.title}.`,
      url: s.sourceUrl as string,
      attribution: "Pearson Education Ltd.",
      resourceType: "specification" as const,
      isVerified: s.status === "verified",
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
}
