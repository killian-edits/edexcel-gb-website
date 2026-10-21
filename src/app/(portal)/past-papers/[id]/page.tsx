import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPastPaperById, getAllPastPapers } from '@/lib/past-papers/service';
import { PaperWorkspace } from '@/components/past-papers/paper-workspace';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paper = await getPastPaperById(id);

  if (!paper) {
    return {
      title: 'Paper Not Found | Edexify',
    };
  }

  const sessionLabel =
    paper.session.charAt(0).toUpperCase() + paper.session.slice(1);

  return {
    title: `${paper.subjectTitle} (${paper.paperCode}) ${sessionLabel} ${paper.year} | Past Paper Practice`,
    description: `Attempt ${paper.subjectTitle} ${paper.paperCode} ${sessionLabel} ${paper.year} with matching mark scheme in the split-screen workspace.`,
  };
}

export async function generateStaticParams() {
  const papers = await getAllPastPapers();
  return papers.map((paper) => ({
    id: paper.id,
  }));
}

export default async function PastPaperWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const paper = await getPastPaperById(id);

  if (!paper) {
    notFound();
  }

  return <PaperWorkspace paper={paper} />;
}

