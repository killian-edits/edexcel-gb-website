/**
 * Async Supabase queries for subjects, components, and grade boundaries.
 * Directly communicates with Supabase PostgreSQL tables.
 *
 * Uses createStaticSupabaseClient() for public, static, and build-time queries
 * (e.g., generateStaticParams, public page rendering) to avoid next/headers cookies() errors.
 */

import { createStaticSupabaseClient } from '@/lib/supabase/server';
import type {
  Subject,
  SubjectComponent,
  GradeBoundary,
  Tier,
  VerificationStatus,
  SeriesType,
  GradeThresholds,
} from '@/types';

interface SubjectRow {
  id: string;
  code: string;
  version: string;
  title: string;
  qualification: string;
  tiers: string[] | null;
  status: string;
  source_url: string | null;
  source_notes: string | null;
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

function mapSubjectRow(row: SubjectRow): Subject {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    qualification: row.qualification,
    version: row.version,
    tiers: (row.tiers as Tier[] | null) ?? null,
    status: (row.status as VerificationStatus) ?? 'verified',
    sourceUrl: row.source_url,
    sourceNotes: row.source_notes,
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
    weightingPercent: row.weighting_percent !== null ? Number(row.weighting_percent) : null,
    scalingFactor: row.scaling_factor !== null ? Number(row.scaling_factor) : null,
    sortOrder: Number(row.sort_order),
    status: (row.status as VerificationStatus) ?? 'verified',
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
    verificationStatus: (row.verification_status as VerificationStatus) ?? 'verified',
    dataVersion: Number(row.data_version ?? 1),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('code', { ascending: true });

  if (error || !data) return [];
  return (data as SubjectRow[]).map(mapSubjectRow);
}

export async function getSubjectByCode(code: string): Promise<Subject | null> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .ilike('code', code)
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
    .from('subjects')
    .select('*')
    .or(`code.ilike.%${normalized}%,title.ilike.%${normalized}%,qualification.ilike.%${normalized}%`)
    .order('code', { ascending: true });

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
    .from('subject_components')
    .select('*')
    .eq('subject_id', subjectId)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  const components = (data as ComponentRow[]).map(mapComponentRow);

  if (tier === 'higher') {
    return components.filter((c) => c.componentCode.endsWith('H') || !c.componentCode.match(/[HF]$/));
  }
  if (tier === 'foundation') {
    return components.filter((c) => c.componentCode.endsWith('F') || !c.componentCode.match(/[HF]$/));
  }

  return components;
}

export async function getAllBoundaries(): Promise<GradeBoundary[]> {
  const supabase = createStaticSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('grade_boundaries')
    .select('*')
    .order('year', { ascending: false });

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
    .from('grade_boundaries')
    .select('*')
    .eq('subject_id', subjectId)
    .order('year', { ascending: false });

  if (tier !== undefined) {
    if (tier === null) {
      query = query.is('tier', null);
    } else {
      query = query.eq('tier', tier);
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
    .from('grade_boundaries')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('series', series);

  if (tier !== undefined) {
    if (tier === null) {
      query = query.is('tier', null);
    } else {
      query = query.eq('tier', tier);
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
  return [...new Set(boundaries.map((b) => b.series))].sort().reverse();
}
