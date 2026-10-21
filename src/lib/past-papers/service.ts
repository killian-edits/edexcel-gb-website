import { createStaticSupabaseClient } from '@/lib/supabase/server';
import { getPublicEnv, isSupabaseConfigured } from '@/lib/config/env';
import type { PastPaper } from '@/types';

export interface PastPaperFilters {
  subject?: string;
  year?: number | string;
  session?: string;
  paperNumber?: string;
  search?: string;
}

/**
 * Known syllabus paper structures for all configured Pearson Edexcel IGCSE subjects.
 * Used for deterministic fallback indexing when database records are being provisioned.
 */
export const KNOWN_IGCSE_PAPERS: Array<{
  subjectCode: string;
  subjectTitle: string;
  qualification: string;
  specificationCode: string;
  year: number;
  session: 'june' | 'january' | 'november';
  paperNumber: string;
  paperCode: string;
  tier: 'higher' | 'foundation' | 'untiered' | null;
}> = [
  // Mathematics A (4MA1) - 2024 June
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'june', paperNumber: '1H', paperCode: '4MA1/1H', tier: 'higher' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'june', paperNumber: '2H', paperCode: '4MA1/2H', tier: 'higher' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'june', paperNumber: '1F', paperCode: '4MA1/1F', tier: 'foundation' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'june', paperNumber: '2F', paperCode: '4MA1/2F', tier: 'foundation' },
  // Mathematics A (4MA1) - 2024 January
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'january', paperNumber: '1H', paperCode: '4MA1/1H', tier: 'higher' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2024, session: 'january', paperNumber: '2H', paperCode: '4MA1/2H', tier: 'higher' },
  // Mathematics A (4MA1) - 2023 June
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2023, session: 'june', paperNumber: '1H', paperCode: '4MA1/1H', tier: 'higher' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2023, session: 'june', paperNumber: '2H', paperCode: '4MA1/2H', tier: 'higher' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2023, session: 'june', paperNumber: '1F', paperCode: '4MA1/1F', tier: 'foundation' },
  { subjectCode: '4MA1', subjectTitle: 'Mathematics A', qualification: 'International GCSE', specificationCode: '4MA1', year: 2023, session: 'june', paperNumber: '2F', paperCode: '4MA1/2F', tier: 'foundation' },

  // Physics (4PH1) - 2024 June
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2024, session: 'june', paperNumber: '1P', paperCode: '4PH1/1P', tier: 'untiered' },
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2024, session: 'june', paperNumber: '2P', paperCode: '4PH1/2P', tier: 'untiered' },
  // Physics (4PH1) - 2024 January
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2024, session: 'january', paperNumber: '1P', paperCode: '4PH1/1P', tier: 'untiered' },
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2024, session: 'january', paperNumber: '2P', paperCode: '4PH1/2P', tier: 'untiered' },
  // Physics (4PH1) - 2023 June
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2023, session: 'june', paperNumber: '1P', paperCode: '4PH1/1P', tier: 'untiered' },
  { subjectCode: '4PH1', subjectTitle: 'Physics', qualification: 'International GCSE', specificationCode: '4PH1', year: 2023, session: 'june', paperNumber: '2P', paperCode: '4PH1/2P', tier: 'untiered' },

  // Chemistry (4CH1) - 2024 June
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2024, session: 'june', paperNumber: '1C', paperCode: '4CH1/1C', tier: 'untiered' },
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2024, session: 'june', paperNumber: '2C', paperCode: '4CH1/2C', tier: 'untiered' },
  // Chemistry (4CH1) - 2024 January
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2024, session: 'january', paperNumber: '1C', paperCode: '4CH1/1C', tier: 'untiered' },
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2024, session: 'january', paperNumber: '2C', paperCode: '4CH1/2C', tier: 'untiered' },
  // Chemistry (4CH1) - 2023 June
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2023, session: 'june', paperNumber: '1C', paperCode: '4CH1/1C', tier: 'untiered' },
  { subjectCode: '4CH1', subjectTitle: 'Chemistry', qualification: 'International GCSE', specificationCode: '4CH1', year: 2023, session: 'june', paperNumber: '2C', paperCode: '4CH1/2C', tier: 'untiered' },

  // English Language B (4EB1) - 2024 June
  { subjectCode: '4EB1', subjectTitle: 'English Language B', qualification: 'International GCSE', specificationCode: '4EB1', year: 2024, session: 'june', paperNumber: '1', paperCode: '4EB1/01', tier: 'untiered' },
  { subjectCode: '4EB1', subjectTitle: 'English Language B', qualification: 'International GCSE', specificationCode: '4EB1', year: 2024, session: 'june', paperNumber: '1R', paperCode: '4EB1/01R', tier: 'untiered' },
  // English Language B (4EB1) - 2024 January
  { subjectCode: '4EB1', subjectTitle: 'English Language B', qualification: 'International GCSE', specificationCode: '4EB1', year: 2024, session: 'january', paperNumber: '1', paperCode: '4EB1/01', tier: 'untiered' },
  // English Language B (4EB1) - 2023 June
  { subjectCode: '4EB1', subjectTitle: 'English Language B', qualification: 'International GCSE', specificationCode: '4EB1', year: 2023, session: 'june', paperNumber: '1', paperCode: '4EB1/01', tier: 'untiered' },
];

/**
 * Build a canonical public Supabase Storage URL for a given path inside 'past_papers'.
 */
export function getPastPaperStorageUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const { supabaseUrl } = getPublicEnv();
  if (!supabaseUrl) return null;
  // Clean path
  const cleanPath = storagePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/past_papers/${cleanPath}`;
}

/**
 * Generate a deterministic ID for paper linking
 */
export function getDeterministicPaperId(item: {
  subjectCode: string;
  year: number;
  session: string;
  paperNumber: string;
}): string {
  const normSubject = item.subjectCode.toLowerCase();
  const normSession = item.session.toLowerCase();
  const normPaper = item.paperNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${normSubject}-${item.year}-${normSession}-p${normPaper}`;
}

/**
 * Get all past papers, combining Supabase DB rows with standard registered specifications.
 */
export async function getAllPastPapers(): Promise<PastPaper[]> {
  let dbPapers: PastPaper[] = [];

  if (isSupabaseConfigured()) {
    try {
      const client = createStaticSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('past_papers')
          .select('*')
          .order('year', { ascending: false })
          .order('session', { ascending: true });

        if (!error && data && data.length > 0) {
          dbPapers = data.map((row: any) => ({
            id: row.id,
            subjectCode: row.subject_code,
            subjectTitle: row.subject_title,
            qualification: row.qualification || 'International GCSE',
            specificationCode: row.specification_code || row.subject_code,
            year: row.year,
            session: row.session,
            paperNumber: row.paper_number,
            paperCode: row.paper_code,
            tier: row.tier,
            questionPaperPath: row.question_paper_path,
            markSchemePath: row.mark_scheme_path,
            questionPaperUrl: getPastPaperStorageUrl(row.question_paper_path),
            markSchemeUrl: getPastPaperStorageUrl(row.mark_scheme_path),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      }
    } catch {
      // Fallback cleanly if table is not yet migrated in Supabase
    }
  }

  // If DB rows exist, return them
  if (dbPapers.length > 0) {
    return dbPapers;
  }

  // Standard registered specification papers (ensures instant availability for all supported subjects)
  return KNOWN_IGCSE_PAPERS.map((kp) => {
    const id = getDeterministicPaperId(kp);
    // Standard structured storage paths in the 'past_papers' bucket:
    // e.g. "4MA1/2024-june/4MA1_1H_qp.pdf" and "4MA1/2024-june/4MA1_1H_ms.pdf"
    const safeCode = kp.paperCode.replace('/', '_').replace(/\s+/g, '');
    const qpPath = `${kp.subjectCode}/${kp.year}-${kp.session}/${safeCode}_qp.pdf`;
    const msPath = `${kp.subjectCode}/${kp.year}-${kp.session}/${safeCode}_ms.pdf`;

    return {
      id,
      subjectCode: kp.subjectCode,
      subjectTitle: kp.subjectTitle,
      qualification: kp.qualification,
      specificationCode: kp.specificationCode,
      year: kp.year,
      session: kp.session,
      paperNumber: kp.paperNumber,
      paperCode: kp.paperCode,
      tier: kp.tier,
      questionPaperPath: qpPath,
      markSchemePath: msPath,
      questionPaperUrl: getPastPaperStorageUrl(qpPath),
      markSchemeUrl: getPastPaperStorageUrl(msPath),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Retrieve a specific past paper by ID
 */
export async function getPastPaperById(id: string): Promise<PastPaper | null> {
  const all = await getAllPastPapers();
  const normalized = id.toLowerCase().trim();
  const found = all.find((p) => p.id.toLowerCase() === normalized);
  return found || null;
}

/**
 * Filter past papers by search query, subject, year, session, and paper number.
 */
export function filterPastPapers(papers: PastPaper[], filters: PastPaperFilters): PastPaper[] {
  return papers.filter((paper) => {
    if (filters.subject && filters.subject !== 'all') {
      if (paper.subjectCode.toUpperCase() !== filters.subject.toUpperCase()) {
        return false;
      }
    }

    if (filters.year && filters.year !== 'all') {
      if (String(paper.year) !== String(filters.year)) {
        return false;
      }
    }

    if (filters.session && filters.session !== 'all') {
      if (paper.session.toLowerCase() !== filters.session.toLowerCase()) {
        return false;
      }
    }

    if (filters.paperNumber && filters.paperNumber !== 'all') {
      if (paper.paperNumber.toLowerCase() !== filters.paperNumber.toLowerCase()) {
        return false;
      }
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      const matchesSearch =
        paper.subjectTitle.toLowerCase().includes(q) ||
        paper.subjectCode.toLowerCase().includes(q) ||
        paper.paperCode.toLowerCase().includes(q) ||
        paper.paperNumber.toLowerCase().includes(q) ||
        String(paper.year).includes(q) ||
        paper.session.toLowerCase().includes(q);

      if (!matchesSearch) return false;
    }

    return true;
  });
}

