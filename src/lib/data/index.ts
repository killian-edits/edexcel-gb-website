/**
 * Data access layer — queries Supabase database asynchronously.
 */

import type {
  Subject,
  SubjectComponent,
  GradeBoundary,
  SavedCalculation,
} from '@/types';
import {
  getAllSubjects as getSupabaseAllSubjects,
  getSubjectByCode as getSupabaseSubjectByCode,
  searchSubjects as searchSupabaseSubjects,
  getComponentsForSubject as getSupabaseComponentsForSubject,
  getAllBoundaries as getSupabaseAllBoundaries,
  getBoundariesForSubject as getSupabaseBoundariesForSubject,
  getBoundary as getSupabaseBoundary,
  getAvailableSeries as getSupabaseAvailableSeries,
  getResources as getSupabaseResources,
} from '@/lib/supabase/supabase-queries';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getResources() {
  return getSupabaseResources();
}

// ─── Subjects ───────────────────────────────────────────────

export async function getAllSubjects(): Promise<Subject[]> {
  return getSupabaseAllSubjects();
}

export async function getSubjectByCode(code: string): Promise<Subject | null> {
  return getSupabaseSubjectByCode(code);
}

export async function searchSubjects(query: string): Promise<Subject[]> {
  return searchSupabaseSubjects(query);
}

// ─── Components ─────────────────────────────────────────────

export async function getAllComponents(): Promise<SubjectComponent[]> {
  const { getAllComponents: getSupabaseAllComponents } = await import('@/lib/supabase/supabase-queries');
  return getSupabaseAllComponents();
}

export async function getComponentsForSubject(
  subjectId: string,
  tier?: string | null,
): Promise<SubjectComponent[]> {
  return getSupabaseComponentsForSubject(subjectId, tier);
}

// ─── Grade Boundaries ───────────────────────────────────────

export async function getAllBoundaries(): Promise<GradeBoundary[]> {
  return getSupabaseAllBoundaries();
}

export async function getBoundariesForSubject(
  subjectId: string,
  tier?: string | null,
): Promise<GradeBoundary[]> {
  return getSupabaseBoundariesForSubject(subjectId, tier);
}

export async function getBoundary(
  subjectId: string,
  series: string,
  tier?: string | null,
): Promise<GradeBoundary | null> {
  return getSupabaseBoundary(subjectId, series, tier);
}

export async function getAvailableSeries(
  subjectId: string,
  tier?: string | null,
): Promise<string[]> {
  return getSupabaseAvailableSeries(subjectId, tier);
}

// ─── Saved Calculations ─────────────────────────────────────

export async function getSavedCalculations(
  userId: string,
): Promise<SavedCalculation[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('saved_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    subjectCode: row.subject_code,
    subjectTitle: row.subject_title,
    series: row.series,
    tier: row.tier,
    variant: row.variant,
    inputMarks: row.input_marks,
    resultGrade: row.result_grade,
    resultTotal: row.result_total,
    resultMaxTotal: row.result_max_total,
    calculationType: row.calculation_type,
    calculationModelVersion: row.calculation_model_version,
    isMockResult: Boolean(row.is_mock_result),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveCalculation(
  calculation: Omit<SavedCalculation, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<SavedCalculation | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('saved_calculations')
    .insert({
      user_id: calculation.userId,
      subject_code: calculation.subjectCode,
      subject_title: calculation.subjectTitle,
      series: calculation.series,
      tier: calculation.tier,
      variant: calculation.variant,
      input_marks: calculation.inputMarks,
      result_grade: calculation.resultGrade,
      result_total: calculation.resultTotal,
      result_max_total: calculation.resultMaxTotal,
      calculation_type: calculation.calculationType,
      calculation_model_version: calculation.calculationModelVersion,
      is_mock_result: calculation.isMockResult,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    subjectCode: data.subject_code,
    subjectTitle: data.subject_title,
    series: data.series,
    tier: data.tier,
    variant: data.variant,
    inputMarks: data.input_marks,
    resultGrade: data.result_grade,
    resultTotal: data.result_total,
    resultMaxTotal: data.result_max_total,
    calculationType: data.calculation_type,
    calculationModelVersion: data.calculation_model_version,
    isMockResult: Boolean(data.is_mock_result),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteCalculation(
  id: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('saved_calculations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return !error;
}
