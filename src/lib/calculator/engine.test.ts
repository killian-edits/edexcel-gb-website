import { describe, it, expect } from 'vitest';
import {
  calculateGrade,
  calculateTarget,
  determineGrade,
  validateMarks,
  aggregateMarks,
} from './engine';
import type { SubjectComponent, GradeBoundary } from '../../types';

// Mock Higher Tier Components (Maths A)
const sampleMathsHigherComponents: SubjectComponent[] = [
  {
    id: 'c1',
    subjectId: 's1',
    componentCode: '1H',
    componentName: 'Paper 1H',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'c2',
    subjectId: 's1',
    componentCode: '2H',
    componentName: 'Paper 2H',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Mock June 2024 Boundary
const sampleBoundary: GradeBoundary = {
  id: 'b1',
  subjectId: 's1',
  series: 'june-2024',
  seriesType: 'june',
  year: 2024,
  tier: 'higher',
  variant: null,
  componentCode: null,
  thresholds: {
    '9': 176,
    '8': 148,
    '7': 120,
    '6': 92,
    '5': 67,
    '4': 42,
    '3': 25,
  },
  maxMark: 200,
  source: 'Verified Official Publication',
  publicationDate: '2024-08-20',
  verificationStatus: 'verified',
  dataVersion: 1,
  createdBy: null,
  createdAt: '2024-08-20',
  updatedAt: '2024-08-20',
};

describe('Grading Engine: determineGrade', () => {
  it('correctly awards 9 at and above threshold', () => {
    const res = determineGrade(176, sampleBoundary.thresholds);
    expect(res.grade).toBe('9');
    expect(res.nextGrade).toBeNull();
    expect(res.marksToNext).toBeNull();

    const resOver = determineGrade(190, sampleBoundary.thresholds);
    expect(resOver.grade).toBe('9');
  });

  it('correctly awards 8 immediately below 9 threshold', () => {
    const res = determineGrade(175, sampleBoundary.thresholds);
    expect(res.grade).toBe('8');
    expect(res.nextGrade).toBe('9');
    expect(res.marksToNext).toBe(1);
  });

  it('awards U when score falls below lowest grade', () => {
    const res = determineGrade(20, sampleBoundary.thresholds);
    expect(res.grade).toBe('U');
    expect(res.nextGrade).toBe('3');
    expect(res.marksToNext).toBe(5);
  });
});

describe('Grading Engine: validateMarks', () => {
  it('rejects marks greater than component maximum', () => {
    const errors = validateMarks(
      [
        { componentCode: '1H', rawMark: 105 },
        { componentCode: '2H', rawMark: 80 },
      ],
      sampleMathsHigherComponents
    );
    expect(errors.some((e) => e.code === 'EXCEEDS_MAXIMUM')).toBe(true);
  });

  it('rejects negative marks', () => {
    const errors = validateMarks(
      [
        { componentCode: '1H', rawMark: -5 },
        { componentCode: '2H', rawMark: 80 },
      ],
      sampleMathsHigherComponents
    );
    expect(errors.some((e) => e.code === 'NEGATIVE_MARK')).toBe(true);
  });

  it('flags missing required components', () => {
    const errors = validateMarks(
      [{ componentCode: '1H', rawMark: 80 }],
      sampleMathsHigherComponents
    );
    expect(errors.some((e) => e.code === 'MISSING_COMPONENT')).toBe(true);
  });
});

describe('Grading Engine: calculateGrade full flow', () => {
  it('calculates deterministic 9 outcome for valid full inputs', () => {
    const result = calculateGrade(
      {
        subjectCode: '4MA1',
        series: 'june-2024',
        tier: 'higher',
        variant: null,
        componentMarks: [
          { componentCode: '1H', rawMark: 90 },
          { componentCode: '2H', rawMark: 88 },
        ],
      },
      {
        components: sampleMathsHigherComponents,
        boundary: sampleBoundary,
      }
    );

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.totalMark).toBe(178);
      expect(result.grade).toBe('9');
      expect(result.marksToNextGrade).toBeNull();
    }
  });

  it('detects unverified boundaries and returns missing_data', () => {
    const unverifiedBoundary: GradeBoundary = {
      ...sampleBoundary,
      verificationStatus: 'unverified',
    };

    const result = calculateGrade(
      {
        subjectCode: '4MA1',
        series: 'june-2024',
        tier: 'higher',
        variant: null,
        componentMarks: [
          { componentCode: '1H', rawMark: 90 },
          { componentCode: '2H', rawMark: 88 },
        ],
      },
      {
        components: sampleMathsHigherComponents,
        boundary: unverifiedBoundary,
      }
    );

    expect(result.status).toBe('missing_data');
  });
});

describe('Grading Engine: Target Planner', () => {
  it('correctly calculates required marks when achievable', () => {
    const result = calculateTarget(
      {
        subjectCode: '4MA1',
        series: 'june-2024',
        tier: 'higher',
        variant: null,
        targetGrade: '8', // Requires 148 total
        completedMarks: [{ componentCode: '1H', rawMark: 75 }], // 148 - 75 = 73 required on 2H
      },
      {
        components: sampleMathsHigherComponents,
        boundary: sampleBoundary,
      }
    );

    expect(result.status).toBe('target_achievable');
    if (result.status === 'target_achievable') {
      expect(result.requiredRemaining).toBe(73);
      expect(result.remainingCapacity).toBe(100);
    }
  });

  it('flags mathematically impossible targets', () => {
    const result = calculateTarget(
      {
        subjectCode: '4MA1',
        series: 'june-2024',
        tier: 'higher',
        variant: null,
        targetGrade: '9', // Requires 176 total
        completedMarks: [{ componentCode: '1H', rawMark: 70 }], // Remaining max is 100 -> Max possible = 170 < 176
      },
      {
        components: sampleMathsHigherComponents,
        boundary: sampleBoundary,
      }
    );

    expect(result.status).toBe('target_impossible');
  });
});
