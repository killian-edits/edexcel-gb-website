/**
 * Validation schemas using Zod.
 *
 * Shared between client and server to avoid duplicated rules.
 */

import { z } from 'zod';

// ─── Common ─────────────────────────────────────────────────

export const gradeSchema = z.enum(['9', '8', '7', '6', '5', '4', '3', '2', '1', 'U']);

export const tierSchema = z.enum(['foundation', 'higher']).nullable();

export const seriesTypeSchema = z.enum(['june', 'january']);

// ─── Calculator Input ───────────────────────────────────────

export const componentMarkSchema = z.object({
  componentCode: z.string().min(1, 'Component code is required'),
  rawMark: z
    .number()
    .int('Mark must be a whole number')
    .nonnegative('Mark cannot be negative'),
});

export const calculationInputSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  series: z.string().min(1, 'Series is required'),
  tier: tierSchema,
  variant: z.string().nullable(),
  componentMarks: z
    .array(componentMarkSchema)
    .min(1, 'At least one component mark is required'),
});

export const targetPlannerInputSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  series: z.string().min(1, 'Series is required'),
  tier: tierSchema,
  variant: z.string().nullable(),
  targetGrade: gradeSchema,
  completedMarks: z.array(componentMarkSchema),
});

// ─── Auth ───────────────────────────────────────────────────

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  displayName: z.string().max(100, 'Display name is too long').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ─── Admin — Grade Boundaries ───────────────────────────────

export const gradeThresholdsSchema = z.record(
  gradeSchema,
  z.number().int().nonnegative(),
);

export const gradeBoundaryInputSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
  series: z.string().min(1, 'Series is required'),
  seriesType: seriesTypeSchema,
  year: z.number().int().min(2000).max(2100),
  tier: tierSchema,
  variant: z.string().nullable(),
  componentCode: z.string().nullable(),
  thresholds: gradeThresholdsSchema,
  maxMark: z.number().int().positive('Maximum mark must be positive'),
  source: z.string().min(1, 'Source is required'),
  publicationDate: z.string().nullable(),
  verificationStatus: z.enum(['draft', 'unverified', 'verified', 'retired']),
});

// ─── Admin — Subjects ───────────────────────────────────────

export const subjectInputSchema = z.object({
  code: z
    .string()
    .min(1, 'Subject code is required')
    .max(10, 'Subject code is too long'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  qualification: z.string().min(1, 'Qualification is required'),
  version: z.string().min(1, 'Version is required'),
  tiers: z.array(z.enum(['foundation', 'higher'])).nullable(),
  status: z.enum(['draft', 'unverified', 'verified', 'retired']),
  sourceUrl: z.string().url('Invalid URL').nullable().or(z.literal('')),
  sourceNotes: z.string().max(1000).nullable(),
});

export const componentInputSchema = z.object({
  componentCode: z.string().min(1, 'Component code is required'),
  componentName: z.string().min(1, 'Component name is required'),
  maxRawMarks: z.number().int().positive('Maximum marks must be positive'),
  duration: z.string().nullable(),
  weightingPercent: z.number().min(0).max(100).nullable(),
  scalingFactor: z.number().positive().nullable(),
  sortOrder: z.number().int().nonnegative(),
  status: z.enum(['draft', 'unverified', 'verified', 'retired']),
});

// ─── Type Exports ───────────────────────────────────────────

export type CalculationInputSchema = z.infer<typeof calculationInputSchema>;
export type TargetPlannerInputSchema = z.infer<typeof targetPlannerInputSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type GradeBoundaryInputSchema = z.infer<typeof gradeBoundaryInputSchema>;
export type SubjectInputSchema = z.infer<typeof subjectInputSchema>;
export type ComponentInputSchema = z.infer<typeof componentInputSchema>;

