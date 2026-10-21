import type { PastPaper } from '@/types';

export interface PastPaperFilters {
  subject?: string;
  year?: number | string;
  session?: string;
  paperNumber?: string;
  search?: string;
}

/**
 * Filter past papers by search query, subject, year, session, and paper number.
 * Pure utility function safe for both client and server components.
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

