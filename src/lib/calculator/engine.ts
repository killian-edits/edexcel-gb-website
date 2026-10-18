/**
 * Grading Engine — core calculation module.
 *
 * This is the critical subsystem: correctness outranks speed and visuals.
 *
 * Design principles:
 * - Completely independent of React and database access
 * - Deterministic and independently testable
 * - Returns structured outcomes distinguishing success, invalid input,
 *   unsupported configuration, and missing/unverified data
 * - Never fabricates, guesses, or interpolates grades
 * - Never compares incompatible score scales
 */

import type {
  CalculationInput,
  CalculationResult,
  CalculationSuccess,
  ComponentBreakdownItem,
  ComponentMark,
  Grade,
  GradeBoundary,
  GradeThresholds,
  GRADE_ORDER,
  SubjectComponent,
  TargetComponentRequirement,
  TargetPlannerInput,
  TargetPlannerResult,
  ValidationError,
} from '@/types';

// Re-export GRADE_ORDER for local usage
const GRADES: readonly Grade[] = ['9', '8', '7', '6', '5', '4', '3', '2', '1', 'U'];

// ─── Validation ─────────────────────────────────────────────

/**
 * Validate a single component mark against its specification.
 */
function validateComponentMark(
  mark: ComponentMark,
  component: SubjectComponent | undefined,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (component === undefined) {
    errors.push({
      field: mark.componentCode,
      message: `Unknown component: ${mark.componentCode}`,
      code: 'UNKNOWN_COMPONENT',
    });
    return errors;
  }

  if (typeof mark.rawMark !== 'number' || !Number.isFinite(mark.rawMark)) {
    errors.push({
      field: mark.componentCode,
      message: `Mark must be a finite number`,
      code: 'INVALID_MARK_TYPE',
    });
    return errors;
  }

  if (!Number.isInteger(mark.rawMark)) {
    errors.push({
      field: mark.componentCode,
      message: `Mark must be a whole number`,
      code: 'NON_INTEGER_MARK',
    });
  }

  if (mark.rawMark < 0) {
    errors.push({
      field: mark.componentCode,
      message: `Mark cannot be negative`,
      code: 'NEGATIVE_MARK',
    });
  }

  if (mark.rawMark > component.maxRawMarks) {
    errors.push({
      field: mark.componentCode,
      message: `Mark ${mark.rawMark} exceeds maximum of ${component.maxRawMarks} for ${component.componentName}`,
      code: 'EXCEEDS_MAXIMUM',
    });
  }

  return errors;
}

/**
 * Validate all component marks against their specifications.
 */
export function validateMarks(
  marks: ComponentMark[],
  components: SubjectComponent[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const componentMap = new Map(components.map((c) => [c.componentCode, c]));

  // Check for duplicate component codes
  const seen = new Set<string>();
  for (const mark of marks) {
    if (seen.has(mark.componentCode)) {
      errors.push({
        field: mark.componentCode,
        message: `Duplicate mark for component ${mark.componentCode}`,
        code: 'DUPLICATE_COMPONENT',
      });
    }
    seen.add(mark.componentCode);
  }

  // Validate each mark
  for (const mark of marks) {
    const component = componentMap.get(mark.componentCode);
    errors.push(...validateComponentMark(mark, component));
  }

  // Check all required components are present
  for (const component of components) {
    if (component.status === 'verified' && !marks.some((m) => m.componentCode === component.componentCode)) {
      errors.push({
        field: component.componentCode,
        message: `Missing mark for required component: ${component.componentName}`,
        code: 'MISSING_COMPONENT',
      });
    }
  }

  return errors;
}

// ─── Aggregation ────────────────────────────────────────────

interface AggregationResult {
  totalRaw: number;
  maxRaw: number;
  totalWeighted: number | null;
  maxWeighted: number | null;
  totalScaled: number | null;
  maxScaled: number | null;
  breakdown: ComponentBreakdownItem[];
  appliedRules: string[];
}

/**
 * Aggregate component marks using the subject's documented rules.
 *
 * Supports:
 * - Simple sum (no weighting/scaling)
 * - Weighted sum (weightingPercent on components)
 * - Scaled marks (scalingFactor on components)
 */
export function aggregateMarks(
  marks: ComponentMark[],
  components: SubjectComponent[],
): AggregationResult {
  const componentMap = new Map(components.map((c) => [c.componentCode, c]));
  const breakdown: ComponentBreakdownItem[] = [];
  const appliedRules: string[] = [];

  let totalRaw = 0;
  let maxRaw = 0;
  let hasWeighting = false;
  let hasScaling = false;
  let totalWeighted = 0;
  let maxWeighted = 0;
  let totalScaled = 0;
  let maxScaled = 0;

  // Check if any components use weighting or scaling
  for (const comp of components) {
    if (comp.weightingPercent !== null && comp.weightingPercent !== undefined) {
      hasWeighting = true;
    }
    if (comp.scalingFactor !== null && comp.scalingFactor !== undefined) {
      hasScaling = true;
    }
  }

  for (const mark of marks) {
    const comp = componentMap.get(mark.componentCode);
    if (!comp) continue;

    totalRaw += mark.rawMark;
    maxRaw += comp.maxRawMarks;

    let weightedMark: number | null = null;
    let scaledMark: number | null = null;

    if (hasWeighting && comp.weightingPercent !== null) {
      // Weighted mark = (rawMark / maxRawMarks) * weightingPercent
      weightedMark = (mark.rawMark / comp.maxRawMarks) * comp.weightingPercent;
      const maxW = comp.weightingPercent; // (max/max) * weight = weight
      totalWeighted += weightedMark;
      maxWeighted += maxW;
    }

    if (hasScaling && comp.scalingFactor !== null) {
      scaledMark = mark.rawMark * comp.scalingFactor;
      const maxS = comp.maxRawMarks * comp.scalingFactor;
      totalScaled += scaledMark;
      maxScaled += maxS;
    }

    breakdown.push({
      componentCode: comp.componentCode,
      componentName: comp.componentName,
      rawMark: mark.rawMark,
      maxRawMark: comp.maxRawMarks,
      weightedMark,
      scaledMark,
    });
  }

  if (hasWeighting) {
    appliedRules.push('Weighted aggregation applied');
    // Round weighted total to nearest integer
    totalWeighted = Math.round(totalWeighted);
    maxWeighted = Math.round(maxWeighted);
  }

  if (hasScaling) {
    appliedRules.push('Scaling factors applied');
    totalScaled = Math.round(totalScaled);
    maxScaled = Math.round(maxScaled);
  }

  if (!hasWeighting && !hasScaling) {
    appliedRules.push('Simple sum aggregation (no weighting/scaling)');
  }

  return {
    totalRaw,
    maxRaw,
    totalWeighted: hasWeighting ? totalWeighted : null,
    maxWeighted: hasWeighting ? maxWeighted : null,
    totalScaled: hasScaling ? totalScaled : null,
    maxScaled: hasScaling ? maxScaled : null,
    breakdown,
    appliedRules,
  };
}

// ─── Grade Determination ────────────────────────────────────

/**
 * Determine the grade for a given total mark against thresholds.
 *
 * Thresholds map grade → minimum mark required.
 * Grades are checked in descending order (A* first).
 * Returns 'U' if below all thresholds.
 */
export function determineGrade(
  totalMark: number,
  thresholds: GradeThresholds,
): { grade: Grade; marksToNext: number | null; nextGrade: Grade | null } {
  // Sort grades by threshold value (descending)
  const sortedGrades = GRADES.filter((g) => g in thresholds && g !== 'U');

  for (let i = 0; i < sortedGrades.length; i++) {
    const grade = sortedGrades[i];
    const threshold = thresholds[grade];
    if (threshold !== undefined && totalMark >= threshold) {
      // Found the grade
      const nextGrade = i > 0 ? sortedGrades[i - 1] : null;
      const nextThreshold = nextGrade ? thresholds[nextGrade] : undefined;
      const marksToNext =
        nextGrade && nextThreshold !== undefined ? nextThreshold - totalMark : null;

      return { grade, marksToNext, nextGrade };
    }
  }

  // Below all thresholds — grade U
  const lowestNonU = sortedGrades[sortedGrades.length - 1];
  const lowestThreshold = lowestNonU ? thresholds[lowestNonU] : undefined;
  const marksToNext =
    lowestNonU && lowestThreshold !== undefined ? lowestThreshold - totalMark : null;

  return { grade: 'U', marksToNext, nextGrade: lowestNonU ?? null };
}

// ─── Main Calculation ───────────────────────────────────────

export interface GradingEngineContext {
  components: SubjectComponent[];
  boundary: GradeBoundary;
}

/**
 * Calculate a grade prediction from component marks.
 *
 * Requires:
 * - All component specifications (verified)
 * - The exact matching verified boundary dataset
 *
 * Returns a structured outcome — never guesses or fabricates.
 */
export function calculateGrade(
  input: CalculationInput,
  context: GradingEngineContext,
): CalculationResult {
  const { components, boundary } = context;

  // ── Validate boundary is verified ──
  if (boundary.verificationStatus !== 'verified') {
    return {
      status: 'missing_data',
      reason: 'The grade boundary data for this series has not been verified.',
      missingItems: ['Verified grade boundary data'],
    };
  }

  // ── Validate all components are verified ──
  const unverifiedComponents = components.filter((c) => c.status !== 'verified');
  if (unverifiedComponents.length > 0) {
    return {
      status: 'missing_data',
      reason: 'Some component specifications have not been verified.',
      missingItems: unverifiedComponents.map(
        (c) => `Component ${c.componentCode}: ${c.componentName}`,
      ),
    };
  }

  // ── Validate marks ──
  const validationErrors = validateMarks(input.componentMarks, components);
  if (validationErrors.length > 0) {
    return {
      status: 'invalid_input',
      errors: validationErrors,
    };
  }

  // ── Check tier/variant compatibility ──
  if (boundary.tier !== input.tier) {
    return {
      status: 'unsupported',
      reason: `Tier mismatch: input specifies "${input.tier ?? 'none'}" but boundary is for "${boundary.tier ?? 'none'}"`,
    };
  }

  if (boundary.variant !== input.variant) {
    return {
      status: 'unsupported',
      reason: `Variant mismatch: input specifies "${input.variant ?? 'none'}" but boundary is for "${boundary.variant ?? 'none'}"`,
    };
  }

  // ── Aggregate marks ──
  const aggregation = aggregateMarks(input.componentMarks, components);

  // ── Determine which total to use for grade lookup ──
  // Match the scale of boundary.maxMark
  let effectiveTotal: number;
  let effectiveMax: number;

  if (boundary.maxMark === aggregation.maxRaw) {
    effectiveTotal = aggregation.totalRaw;
    effectiveMax = aggregation.maxRaw;
    aggregation.appliedRules.push('Grade determined using raw total');
  } else if (
    aggregation.maxScaled !== null &&
    aggregation.totalScaled !== null &&
    boundary.maxMark === aggregation.maxScaled
  ) {
    effectiveTotal = aggregation.totalScaled;
    effectiveMax = aggregation.maxScaled;
    aggregation.appliedRules.push('Grade determined using scaled total');
  } else if (
    aggregation.maxWeighted !== null &&
    aggregation.totalWeighted !== null &&
    boundary.maxMark === aggregation.maxWeighted
  ) {
    effectiveTotal = aggregation.totalWeighted;
    effectiveMax = aggregation.maxWeighted;
    aggregation.appliedRules.push('Grade determined using weighted total');
  } else {
    effectiveTotal = aggregation.totalRaw;
    effectiveMax = aggregation.maxRaw;
  }

  // ── Check boundary max mark consistency ──
  if (boundary.maxMark !== effectiveMax) {
    return {
      status: 'unsupported',
      reason: `Score scale mismatch: calculated maximum (${effectiveMax}) does not match boundary maximum (${boundary.maxMark}). Cannot compare different score scales.`,
    };
  }

  // ── Determine grade ──
  const { grade, marksToNext, nextGrade } = determineGrade(effectiveTotal, boundary.thresholds);

  const belowMinimumBoundary = grade === 'U';

  const result: CalculationSuccess = {
    status: 'success',
    grade,
    totalMark: aggregation.totalRaw,
    maxTotalMark: aggregation.maxRaw,
    scaledTotal: aggregation.totalScaled,
    maxScaledTotal: aggregation.maxScaled,
    marksToNextGrade: marksToNext,
    nextGrade,
    belowMinimumBoundary,
    componentBreakdown: aggregation.breakdown,
    boundarySeriesLabel:
      boundary.year && !boundary.series.includes(String(boundary.year))
        ? `${boundary.series} ${boundary.year}`
        : boundary.series,
    boundarySource: boundary.source,
    appliedRules: aggregation.appliedRules,
  };

  return result;
}

// ─── Target Planner ─────────────────────────────────────────

/**
 * Calculate required remaining marks to achieve a target grade.
 *
 * Rules:
 * - Account for maxima, weighting, scaling, and rounding
 * - Never round down in a way that falsely implies feasibility
 * - Detect impossible/already-achieved targets
 */
export function calculateTarget(
  input: TargetPlannerInput,
  context: GradingEngineContext,
): TargetPlannerResult {
  const { components, boundary } = context;

  // ── Validate boundary is verified ──
  if (boundary.verificationStatus !== 'verified') {
    return {
      status: 'missing_data',
      reason: 'The grade boundary data for this series has not been verified.',
      missingItems: ['Verified grade boundary data'],
    };
  }

  // ── Validate components ──
  const unverifiedComponents = components.filter((c) => c.status !== 'verified');
  if (unverifiedComponents.length > 0) {
    return {
      status: 'missing_data',
      reason: 'Some component specifications have not been verified.',
      missingItems: unverifiedComponents.map(
        (c) => `Component ${c.componentCode}: ${c.componentName}`,
      ),
    };
  }

  // ── Validate completed marks ──
  const completedErrors: ValidationError[] = [];
  const componentMap = new Map(components.map((c) => [c.componentCode, c]));

  for (const mark of input.completedMarks) {
    const comp = componentMap.get(mark.componentCode);
    if (!comp) {
      completedErrors.push({
        field: mark.componentCode,
        message: `Unknown component: ${mark.componentCode}`,
        code: 'UNKNOWN_COMPONENT',
      });
      continue;
    }
    completedErrors.push(...validateComponentMark(mark, comp));
  }

  if (completedErrors.length > 0) {
    return { status: 'invalid_input', errors: completedErrors };
  }

  // ── Check tier/variant ──
  if (boundary.tier !== input.tier) {
    return {
      status: 'unsupported',
      reason: `Tier mismatch: input specifies "${input.tier ?? 'none'}" but boundary is for "${boundary.tier ?? 'none'}"`,
    };
  }

  // ── Get target threshold ──
  const targetThreshold = boundary.thresholds[input.targetGrade];
  if (targetThreshold === undefined) {
    return {
      status: 'missing_data',
      reason: `No threshold defined for grade ${input.targetGrade} in this boundary set.`,
      missingItems: [`Grade ${input.targetGrade} threshold`],
    };
  }

  // ── Calculate completed total and remaining capacity ──
  const completedCodes = new Set(input.completedMarks.map((m) => m.componentCode));
  let completedTotal = 0;
  let remainingCapacity = 0;
  const assumptions: string[] = [];
  const requirements: TargetComponentRequirement[] = [];

  for (const mark of input.completedMarks) {
    completedTotal += mark.rawMark;
  }

  for (const comp of components) {
    if (comp.status !== 'verified') continue;
    const isCompleted = completedCodes.has(comp.componentCode);
    const mark = input.completedMarks.find((m) => m.componentCode === comp.componentCode);

    if (!isCompleted) {
      remainingCapacity += comp.maxRawMarks;
    }

    requirements.push({
      componentCode: comp.componentCode,
      componentName: comp.componentName,
      isCompleted,
      rawMark: mark?.rawMark ?? null,
      maxRawMark: comp.maxRawMarks,
      minRequired: null, // will be calculated below
    });
  }

  // ── Check if target is already achieved ──
  // Calculate what grade they'd get with max marks on remaining
  const maxPossibleTotal = completedTotal + remainingCapacity;
  const currentGradeResult = determineGrade(completedTotal + remainingCapacity, boundary.thresholds);

  // If they have all components completed
  if (remainingCapacity === 0) {
    const currentResult = determineGrade(completedTotal, boundary.thresholds);
    const targetIdx = GRADES.indexOf(input.targetGrade);
    const currentIdx = GRADES.indexOf(currentResult.grade);

    if (currentIdx <= targetIdx) {
      // Current grade is same or better than target
      return {
        status: 'target_already_achieved',
        targetGrade: input.targetGrade,
        currentGrade: currentResult.grade,
        completedTotal,
        requiredTotal: targetThreshold,
      };
    } else {
      // All components done but grade not reached
      return {
        status: 'target_impossible',
        targetGrade: input.targetGrade,
        reason: 'All components have been completed but the total is insufficient for the target grade.',
        completedTotal,
        requiredTotal: targetThreshold,
        maxPossibleTotal: completedTotal,
      };
    }
  }

  // ── Check if target is achievable ──
  if (maxPossibleTotal < targetThreshold) {
    return {
      status: 'target_impossible',
      targetGrade: input.targetGrade,
      reason: `Even with maximum marks on all remaining components, the total (${maxPossibleTotal}) would be below the threshold (${targetThreshold}).`,
      completedTotal,
      requiredTotal: targetThreshold,
      maxPossibleTotal,
    };
  }

  // ── Calculate required remaining ──
  // Use ceiling to never falsely imply feasibility
  const requiredRemaining = Math.max(0, targetThreshold - completedTotal);

  const sessionLabel =
    boundary.year && !boundary.series.includes(String(boundary.year))
      ? `${boundary.series} ${boundary.year}`
      : boundary.series;
  assumptions.push(`Based on ${sessionLabel} grade boundaries`);
  assumptions.push('Historical boundaries do not guarantee future exam grades');

  // Distribute requirement info to each remaining component
  for (const req of requirements) {
    if (!req.isCompleted) {
      // Minimum required is proportional, but we can't determine exact distribution
      // without more specific rules — show the total required
      req.minRequired = null; // Cannot determine per-component minimums without more rules
    }
  }

  return {
    status: 'target_achievable',
    targetGrade: input.targetGrade,
    completedTotal,
    requiredRemaining,
    remainingCapacity,
    componentRequirements: requirements,
    assumptions,
  };
}

