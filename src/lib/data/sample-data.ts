/**
 * Sample/seed data for development and demonstration.
 *
 * ⚠️ THIS IS SAMPLE DATA ONLY — NOT VERIFIED OFFICIAL BOUNDARIES.
 * Never mix with verified production data.
 * Clearly labelled and used only in development when no database is configured.
 *
 * Based on publicly available Edexcel International GCSE grade boundary
 * structures, but values are ILLUSTRATIVE and must be verified before
 * any production use.
 */

import type {
  GradeBoundary,
  Grade,
  Subject,
  SubjectComponent,
} from '@/types';

// ─── Sample Subjects ────────────────────────────────────────

export const sampleSubjects: Subject[] = [
  {
    id: 'subj-4ma1',
    code: '4MA1',
    title: 'Mathematics A',
    qualification: 'International GCSE',
    version: '2017',
    tiers: ['foundation', 'higher'],
    status: 'verified',
    sourceUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/mathematics-a-2016.html',
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'subj-4ch1',
    code: '4CH1',
    title: 'Chemistry',
    qualification: 'International GCSE',
    version: '2017',
    tiers: null,
    status: 'verified',
    sourceUrl: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/chemistry-2017.html',
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'subj-4ph2',
    code: '4PH2',
    title: 'Physics',
    qualification: 'International GCSE',
    version: '2017',
    tiers: null,
    status: 'verified',
    sourceUrl: null,
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'subj-4bi1',
    code: '4BI1',
    title: 'Biology',
    qualification: 'International GCSE',
    version: '2017',
    tiers: null,
    status: 'verified',
    sourceUrl: null,
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'subj-4ea1',
    code: '4EA1',
    title: 'English Language A',
    qualification: 'International GCSE',
    version: '2017',
    tiers: null,
    status: 'verified',
    sourceUrl: null,
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'subj-4ec1',
    code: '4EC1',
    title: 'Economics',
    qualification: 'International GCSE',
    version: '2017',
    tiers: null,
    status: 'verified',
    sourceUrl: null,
    sourceNotes: 'Sample data for development — not verified official boundaries',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Sample Components ──────────────────────────────────────

export const sampleComponents: SubjectComponent[] = [
  // Mathematics A (4MA1) — Higher Tier: Paper 1H and Paper 2H
  {
    id: 'comp-4ma1-1h',
    subjectId: 'subj-4ma1',
    componentCode: '1H',
    componentName: 'Paper 1H (Higher)',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ma1-2h',
    subjectId: 'subj-4ma1',
    componentCode: '2H',
    componentName: 'Paper 2H (Higher)',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Mathematics A (4MA1) — Foundation Tier: Paper 1F and Paper 2F
  {
    id: 'comp-4ma1-1f',
    subjectId: 'subj-4ma1',
    componentCode: '1F',
    componentName: 'Paper 1F (Foundation)',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 3,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ma1-2f',
    subjectId: 'subj-4ma1',
    componentCode: '2F',
    componentName: 'Paper 2F (Foundation)',
    maxRawMarks: 100,
    duration: '2h',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 4,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Chemistry (4CH1) — Paper 1C and Paper 2C
  {
    id: 'comp-4ch1-1c',
    subjectId: 'subj-4ch1',
    componentCode: '1C',
    componentName: 'Paper 1C',
    maxRawMarks: 110,
    duration: '2h',
    weightingPercent: 61.1,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ch1-2c',
    subjectId: 'subj-4ch1',
    componentCode: '2C',
    componentName: 'Paper 2C',
    maxRawMarks: 70,
    duration: '1h 15min',
    weightingPercent: 38.9,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Physics (4PH2) — Paper 1P and Paper 2P
  {
    id: 'comp-4ph2-1p',
    subjectId: 'subj-4ph2',
    componentCode: '1P',
    componentName: 'Paper 1P',
    maxRawMarks: 110,
    duration: '2h',
    weightingPercent: 61.1,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ph2-2p',
    subjectId: 'subj-4ph2',
    componentCode: '2P',
    componentName: 'Paper 2P',
    maxRawMarks: 70,
    duration: '1h 15min',
    weightingPercent: 38.9,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Biology (4BI1) — Paper 1B and Paper 2B
  {
    id: 'comp-4bi1-1b',
    subjectId: 'subj-4bi1',
    componentCode: '1B',
    componentName: 'Paper 1B',
    maxRawMarks: 110,
    duration: '2h',
    weightingPercent: 61.1,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4bi1-2b',
    subjectId: 'subj-4bi1',
    componentCode: '2B',
    componentName: 'Paper 2B',
    maxRawMarks: 70,
    duration: '1h 15min',
    weightingPercent: 38.9,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // English Language A (4EA1) — Paper 1 and Paper 2
  {
    id: 'comp-4ea1-01',
    subjectId: 'subj-4ea1',
    componentCode: '01',
    componentName: 'Paper 1',
    maxRawMarks: 60,
    duration: '2h 15min',
    weightingPercent: 60,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ea1-02',
    subjectId: 'subj-4ea1',
    componentCode: '02',
    componentName: 'Paper 2',
    maxRawMarks: 40,
    duration: '1h 30min',
    weightingPercent: 40,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Economics (4EC1) — Paper 1 and Paper 2
  {
    id: 'comp-4ec1-01',
    subjectId: 'subj-4ec1',
    componentCode: '01',
    componentName: 'Paper 1',
    maxRawMarks: 80,
    duration: '1h 30min',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 1,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'comp-4ec1-02',
    subjectId: 'subj-4ec1',
    componentCode: '02',
    componentName: 'Paper 2',
    maxRawMarks: 80,
    duration: '1h 30min',
    weightingPercent: 50,
    scalingFactor: null,
    sortOrder: 2,
    status: 'verified',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Sample Grade Boundaries ────────────────────────────────

export const sampleBoundaries: GradeBoundary[] = [
  // Maths A Higher — June 2024 (SAMPLE)
  {
    id: 'gb-4ma1-h-jun24',
    subjectId: 'subj-4ma1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: 'higher',
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 176, A: 148, B: 120, C: 92, D: 67, E: 42 },
    maxMark: 200,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Maths A Higher — June 2023 (SAMPLE)
  {
    id: 'gb-4ma1-h-jun23',
    subjectId: 'subj-4ma1',
    series: 'june-2023',
    seriesType: 'june',
    year: 2023,
    tier: 'higher',
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 170, A: 142, B: 114, C: 86, D: 61, E: 36 },
    maxMark: 200,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Maths A Higher — January 2024 (SAMPLE)
  {
    id: 'gb-4ma1-h-jan24',
    subjectId: 'subj-4ma1',
    series: 'january-2024',
    seriesType: 'january',
    year: 2024,
    tier: 'higher',
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 172, A: 144, B: 116, C: 88, D: 63, E: 38 },
    maxMark: 200,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Maths A Foundation — June 2024 (SAMPLE)
  {
    id: 'gb-4ma1-f-jun24',
    subjectId: 'subj-4ma1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: 'foundation',
    variant: null,
    componentCode: null,
    thresholds: { C: 142, D: 112, E: 82, F: 58, G: 34 },
    maxMark: 200,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Chemistry — June 2024 (SAMPLE)
  {
    id: 'gb-4ch1-jun24',
    subjectId: 'subj-4ch1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 148, A: 127, B: 106, C: 85, D: 69, E: 53, F: 37, G: 21 },
    maxMark: 180,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Chemistry — June 2023 (SAMPLE)
  {
    id: 'gb-4ch1-jun23',
    subjectId: 'subj-4ch1',
    series: 'june-2023',
    seriesType: 'june',
    year: 2023,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 144, A: 123, B: 102, C: 81, D: 65, E: 49, F: 33, G: 17 },
    maxMark: 180,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Physics — June 2024 (SAMPLE)
  {
    id: 'gb-4ph2-jun24',
    subjectId: 'subj-4ph2',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 150, A: 129, B: 108, C: 87, D: 70, E: 53, F: 36, G: 19 },
    maxMark: 180,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Biology — June 2024 (SAMPLE)
  {
    id: 'gb-4bi1-jun24',
    subjectId: 'subj-4bi1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 146, A: 125, B: 104, C: 83, D: 67, E: 51, F: 35, G: 19 },
    maxMark: 180,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // English Language A — June 2024 (SAMPLE)
  {
    id: 'gb-4ea1-jun24',
    subjectId: 'subj-4ea1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 82, A: 70, B: 58, C: 46, D: 37, E: 28, F: 20, G: 12 },
    maxMark: 100,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  // Economics — June 2024 (SAMPLE)
  {
    id: 'gb-4ec1-jun24',
    subjectId: 'subj-4ec1',
    series: 'june-2024',
    seriesType: 'june',
    year: 2024,
    tier: null,
    variant: null,
    componentCode: null,
    thresholds: { 'A*': 133, A: 114, B: 95, C: 76, D: 61, E: 46, F: 31, G: 16 },
    maxMark: 160,
    source: 'Sample data — not verified official boundaries',
    publicationDate: null,
    verificationStatus: 'verified',
    dataVersion: 1,
    createdBy: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ─── Helpers ────────────────────────────────────────────────

export function getSubjectByCode(code: string): Subject | undefined {
  return sampleSubjects.find((s) => s.code === code);
}

export function getComponentsForSubject(subjectId: string, tier?: string | null): SubjectComponent[] {
  const comps = sampleComponents.filter((c) => c.subjectId === subjectId);

  // For tiered subjects like Maths, filter by tier
  if (tier === 'higher') {
    return comps.filter((c) => c.componentCode.endsWith('H') || !c.componentCode.match(/[HF]$/));
  }
  if (tier === 'foundation') {
    return comps.filter((c) => c.componentCode.endsWith('F') || !c.componentCode.match(/[HF]$/));
  }

  return comps;
}

export function getBoundariesForSubject(
  subjectId: string,
  tier?: string | null,
): GradeBoundary[] {
  return sampleBoundaries.filter((b) => {
    if (b.subjectId !== subjectId) return false;
    if (tier !== undefined && b.tier !== tier) return false;
    return true;
  });
}

export function getBoundary(
  subjectId: string,
  series: string,
  tier?: string | null,
): GradeBoundary | undefined {
  return sampleBoundaries.find(
    (b) =>
      b.subjectId === subjectId &&
      b.series === series &&
      (tier === undefined || b.tier === tier),
  );
}

export function getAvailableSeries(subjectId: string, tier?: string | null): string[] {
  const boundaries = getBoundariesForSubject(subjectId, tier);
  return [...new Set(boundaries.map((b) => b.series))].sort().reverse();
}

