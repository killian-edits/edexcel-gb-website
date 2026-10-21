/**
 * Core domain types for Edexify.
 *
 * These types model the Edexcel IGCSE grading domain:
 * subjects, specifications, components, grade boundaries,
 * calculations, and the grading engine's structured results.
 */

// ─── Enums & Constants ───────────────────────────────────────

export const GRADE_ORDER = [
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "1",
  "U",
] as const;
export type Grade = (typeof GRADE_ORDER)[number];

export const SERIES_TYPES = ["june", "january"] as const;
export type SeriesType = (typeof SERIES_TYPES)[number];

export const TIERS = ["foundation", "higher"] as const;
export type Tier = (typeof TIERS)[number];

export const VERIFICATION_STATUSES = [
  "draft",
  "unverified",
  "verified",
  "retired",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── Subject & Specification ─────────────────────────────────

export interface Subject {
  id: string;
  code: string;
  title: string;
  qualification: string;
  version: string;
  tiers: Tier[] | null;
  status: VerificationStatus;
  sourceUrl: string | null;
  sourceNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectComponent {
  id: string;
  subjectId: string;
  componentCode: string;
  componentName: string;
  maxRawMarks: number;
  duration: string | null;
  weightingPercent: number | null;
  scalingFactor: number | null;
  sortOrder: number;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Grade Boundaries ────────────────────────────────────────

/** A mapping of grade → minimum raw mark required */
export type GradeThresholds = Partial<Record<Grade, number>>;

export interface GradeBoundary {
  id: string;
  subjectId: string;
  series: string; // e.g. "june-2024", "january-2023"
  seriesType: SeriesType;
  year: number;
  tier: Tier | null;
  variant: string | null;
  componentCode: string | null; // null = overall / total
  thresholds: GradeThresholds;
  maxMark: number;
  source: string;
  publicationDate: string | null;
  verificationStatus: VerificationStatus;
  dataVersion: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Calculator / Grading Engine ────────────────────────────

export interface ComponentMark {
  componentCode: string;
  rawMark: number;
}

export interface CalculationInput {
  subjectCode: string;
  series: string;
  tier: Tier | null;
  variant: string | null;
  componentMarks: ComponentMark[];
}

/** The engine returns one of these structured outcomes */
export type CalculationResult =
  | CalculationSuccess
  | CalculationInvalidInput
  | CalculationUnsupported
  | CalculationMissingData;

export interface CalculationSuccess {
  status: "success";
  grade: Grade;
  totalMark: number;
  maxTotalMark: number;
  scaledTotal: number | null;
  maxScaledTotal: number | null;
  marksToNextGrade: number | null;
  nextGrade: Grade | null;
  belowMinimumBoundary: boolean;
  componentBreakdown: ComponentBreakdownItem[];
  boundarySeriesLabel: string;
  boundarySource: string;
  appliedRules: string[];
}

export interface ComponentBreakdownItem {
  componentCode: string;
  componentName: string;
  rawMark: number;
  maxRawMark: number;
  weightedMark: number | null;
  scaledMark: number | null;
}

export interface CalculationInvalidInput {
  status: "invalid_input";
  errors: ValidationError[];
}

export interface CalculationUnsupported {
  status: "unsupported";
  reason: string;
}

export interface CalculationMissingData {
  status: "missing_data";
  reason: string;
  missingItems: string[];
}

// ─── Target Planner ─────────────────────────────────────────

export interface TargetPlannerInput {
  subjectCode: string;
  series: string;
  tier: Tier | null;
  variant: string | null;
  targetGrade: Grade;
  /** Marks for completed components; absent entries are unattempted */
  completedMarks: ComponentMark[];
}

export type TargetPlannerResult =
  | TargetPlannerSuccess
  | TargetPlannerImpossible
  | TargetPlannerAlreadyAchieved
  | CalculationInvalidInput
  | CalculationUnsupported
  | CalculationMissingData;

export interface TargetPlannerSuccess {
  status: "target_achievable";
  targetGrade: Grade;
  completedTotal: number;
  requiredRemaining: number;
  remainingCapacity: number;
  componentRequirements: TargetComponentRequirement[];
  assumptions: string[];
}

export interface TargetPlannerImpossible {
  status: "target_impossible";
  targetGrade: Grade;
  reason: string;
  completedTotal: number;
  requiredTotal: number;
  maxPossibleTotal: number;
}

export interface TargetPlannerAlreadyAchieved {
  status: "target_already_achieved";
  targetGrade: Grade;
  currentGrade: Grade;
  completedTotal: number;
  requiredTotal: number;
}

export interface TargetComponentRequirement {
  componentCode: string;
  componentName: string;
  isCompleted: boolean;
  rawMark: number | null;
  maxRawMark: number;
  minRequired: number | null;
}

// ─── Validation ─────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ─── Saved Calculations ─────────────────────────────────────

export interface SavedCalculation {
  id: string;
  userId: string;
  subjectCode: string;
  subjectTitle: string;
  series: string;
  tier: Tier | null;
  variant: string | null;
  inputMarks: ComponentMark[];
  resultGrade: Grade | null;
  resultTotal: number | null;
  resultMaxTotal: number | null;
  calculationType: "prediction" | "target_plan";
  calculationModelVersion: string;
  isMockResult: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Past Papers ──────────────────────────────────────────

export interface PastPaper {
  id: string;
  subjectCode: string;
  subjectTitle: string;
  qualification: string;
  specificationCode: string;
  year: number;
  session: 'june' | 'january' | 'november';
  paperNumber: string;
  paperCode: string;
  tier: Tier | 'untiered' | null;
  questionPaperPath: string | null;
  markSchemePath: string | null;
  questionPaperUrl?: string | null;
  markSchemeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── User / Auth ────────────────────────────────────────────

export interface UserProfile {
  id: string;
  displayName: string | null;
  role: UserRole;
  chosenSubjects?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Admin ──────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalCalculations: number;
  supportedSubjects: number;
  recentCalculations: number;
}

// ─── Resources ──────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  description: string;
  subjectCode: string | null;
  url: string;
  attribution: string | null;
  resourceType:
    | "checklist"
    | "formula_sheet"
    | "past_paper"
    | "guide"
    | "specification"
    | "other";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API / Generic ──────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
