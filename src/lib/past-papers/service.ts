import { createStaticSupabaseClient } from '@/lib/supabase/server';
import { getPublicEnv, isSupabaseConfigured } from '@/lib/config/env';
import type { PastPaper } from '@/types';

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
  const cleanPath = storagePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/past_papers/${cleanPath}`;
}

/**
 * Helper to determine default duration for Pearson Edexcel papers
 */
export function getStandardPaperDuration(subjectCode: string, paperNumber: string): string {
  const normSubject = subjectCode.toUpperCase();
  const normPaper = paperNumber.toUpperCase();

  // Mathematics A (4MA1): 2 hours each paper
  if (normSubject === '4MA1') return '2h';

  // Physics (4PH1) and Chemistry (4CH1): Paper 1 is 2h, Paper 2 is 1h 15m
  if (normSubject === '4PH1' || normSubject === '4CH1') {
    if (normPaper.includes('2')) return '1h 15m';
    return '2h';
  }

  // English Language B (4EB1): 3 hours
  if (normSubject === '4EB1') return '3h';

  return '2h';
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
 * Recursively list all file paths uploaded to the Supabase Storage 'past_papers' bucket.
 */
export async function getUploadedStorageFiles(): Promise<Set<string>> {
  const uploadedSet = new Set<string>();
  if (!isSupabaseConfigured()) return uploadedSet;

  try {
    const client = createStaticSupabaseClient();
    if (!client) return uploadedSet;

    const supabaseClient = client;
    async function traverse(prefix = '') {
      const { data, error } = await supabaseClient.storage.from('past_papers').list(prefix);
      if (error || !data) return;

      for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        // Check if item is a folder (folders have null id and no mimetype metadata in Supabase)
        if (item.id === null && (!item.metadata || !item.metadata.mimetype)) {
          await traverse(fullPath);
        } else {
          uploadedSet.add(fullPath.replace(/^\/+/, '').toLowerCase());
        }
      }
    }

    await traverse();
  } catch (err) {
    console.error('Error querying Supabase storage files:', err);
  }

  return uploadedSet;
}

/**
 * Get all available past papers that have documents uploaded to Supabase Storage.
 * Only returns past papers that have uploaded question papers or registered available documents in the bucket.
 */
export async function getAllPastPapers(): Promise<PastPaper[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const uploadedFiles = await getUploadedStorageFiles();
  let papers: PastPaper[] = [];

  try {
    const client = createStaticSupabaseClient();
    if (client) {
      // 1. Fetch any explicit past_papers rows from the database
      const { data, error } = await client
        .from('past_papers')
        .select('*')
        .order('year', { ascending: false })
        .order('session', { ascending: true });

      if (!error && data && data.length > 0) {
        for (const row of data) {
          const qpPath = row.question_paper_path?.replace(/^\/+/, '');
          const msPath = row.mark_scheme_path?.replace(/^\/+/, '');
          const normQp = qpPath?.toLowerCase();
          const normMs = msPath?.toLowerCase();

          // Only keep if the document is actually uploaded in the storage bucket
          const isQpUploaded = normQp ? uploadedFiles.has(normQp) : false;
          const isMsUploaded = normMs ? uploadedFiles.has(normMs) : false;

          if (isQpUploaded || isMsUploaded) {
            papers.push({
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
              duration: row.duration || getStandardPaperDuration(row.subject_code, row.paper_number),
              questionPaperPath: qpPath || null,
              markSchemePath: msPath || null,
              questionPaperUrl: isQpUploaded ? getPastPaperStorageUrl(qpPath) : null,
              markSchemeUrl: isMsUploaded ? getPastPaperStorageUrl(msPath) : null,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error reading past_papers DB table:', err);
  }

  // 2. Discover any additional uploaded files directly from storage paths if not yet inserted into DB
  // Supported folder pattern: <subjectCode>/<year>-<session>/<paperCode>_<type>.pdf
  // Example: 4MA1/2024-june/4MA1_1H_qp.pdf
  const knownSubjectMap: Record<string, string> = {
    '4MA1': 'Mathematics A',
    '4PH1': 'Physics',
    '4CH1': 'Chemistry',
    '4EB1': 'English Language B',
  };

  const processedGroupKeys = new Set<string>(
    papers.map((p) => `${p.subjectCode.toUpperCase()}-${p.year}-${p.session.toLowerCase()}-${p.paperCode.toUpperCase()}`)
  );

  // Group uploaded storage files by subject/year/session/paperCode
  const storageGroups = new Map<string, { qp?: string; ms?: string; subject: string; year: number; session: 'june' | 'january' | 'november'; paperCode: string; paperNumber: string }>();

  for (const filePath of uploadedFiles) {
    const parts = filePath.split('/');
    if (parts.length >= 3) {
      const subject = parts[0].toUpperCase();
      const sessionPart = parts[1].toLowerCase(); // e.g. "2024-june"
      const fileName = parts[2]; // e.g. "4ma1_1h_qp.pdf"

      const [yearStr, sessionStr] = sessionPart.split('-');
      const year = parseInt(yearStr, 10);
      const session = (sessionStr === 'january' || sessionStr === 'november' ? sessionStr : 'june') as 'june' | 'january' | 'november';

      if (!isNaN(year) && fileName.endsWith('.pdf')) {
        const isQp = fileName.includes('_qp') || fileName.includes('qp');
        const isMs = fileName.includes('_ms') || fileName.includes('ms');

        let rawCode = fileName.replace(/_(qp|ms)\.pdf$/i, '').toUpperCase();
        let formattedCode = rawCode;
        if (rawCode.startsWith(subject + '_')) {
          formattedCode = subject + '/' + rawCode.substring(subject.length + 1);
        } else if (!rawCode.includes('/')) {
          formattedCode = `${subject}/${rawCode}`;
        }

        const paperNumber = formattedCode.split('/')[1] || '1';
        const groupKey = `${subject}-${year}-${session}-${formattedCode.toUpperCase()}`;

        if (!storageGroups.has(groupKey)) {
          storageGroups.set(groupKey, {
            subject,
            year,
            session,
            paperCode: formattedCode,
            paperNumber,
          });
        }

        const group = storageGroups.get(groupKey)!;
        if (isQp) group.qp = filePath;
        if (isMs) group.ms = filePath;
      }
    }
  }

  for (const [groupKey, group] of storageGroups.entries()) {
    if (!processedGroupKeys.has(groupKey)) {
      const subjectTitle = knownSubjectMap[group.subject] || group.subject;
      const deterministicId = getDeterministicPaperId({
        subjectCode: group.subject,
        year: group.year,
        session: group.session,
        paperNumber: group.paperNumber,
      });

      papers.push({
        id: deterministicId,
        subjectCode: group.subject,
        subjectTitle,
        qualification: 'International GCSE',
        specificationCode: group.subject,
        year: group.year,
        session: group.session,
        paperNumber: group.paperNumber,
        paperCode: group.paperCode,
        tier: group.paperNumber.toLowerCase().includes('h')
          ? 'higher'
          : group.paperNumber.toLowerCase().includes('f')
          ? 'foundation'
          : 'untiered',
        duration: getStandardPaperDuration(group.subject, group.paperNumber),
        questionPaperPath: group.qp || null,
        markSchemePath: group.ms || null,
        questionPaperUrl: group.qp ? getPastPaperStorageUrl(group.qp) : null,
        markSchemeUrl: group.ms ? getPastPaperStorageUrl(group.ms) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      processedGroupKeys.add(groupKey);
    }
  }

  return papers;
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
