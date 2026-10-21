import React from 'react';
import type { Metadata } from 'next';
import { getAllPastPapers } from '@/lib/past-papers/service';
import { getAllSubjects } from '@/lib/supabase/supabase-queries';
import { PastPapersLibrary } from '@/components/past-papers/past-papers-library';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edexcel IGCSE Past Papers & Mark Schemes | Edexify',
  description:
    'Browse, filter, and practice verified Pearson Edexcel International GCSE examination question papers and matching mark schemes.',
};

export default async function PastPapersPage() {
  const [papers, subjectsData] = await Promise.all([
    getAllPastPapers(),
    getAllSubjects(),
  ]);

  const subjectOptions = subjectsData.map((s) => ({
    code: s.code,
    title: s.title,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#E5E5E5] pb-6 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Edexcel IGCSE Past Papers
            </h1>
          </div>
        </div>
        <p className="text-xs md:text-sm text-[#6B6B6B] max-w-3xl leading-relaxed">
          Access complete examination question papers with their verified corresponding mark schemes.
          Solve papers under timed conditions in the split-screen practice workspace and reveal the official mark scheme when ready.
        </p>
      </div>

      {/* Supabase Storage Notice Banner */}
      <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#0284C7] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0369A1] space-y-1">
          <p className="font-semibold">Integrated Supabase Storage & Database Architecture</p>
          <p>
            Papers and mark schemes are mapped with deterministic IDs linked to the <code className="font-mono bg-white/70 px-1 py-0.5 rounded">past_papers</code> database table and storage bucket. Uploading new PDF releases automatically updates the library without requiring code redeployments.
          </p>
        </div>
      </div>

      {/* Past Papers Interactive Library */}
      <PastPapersLibrary initialPapers={papers} subjects={subjectOptions} />
    </div>
  );
}

