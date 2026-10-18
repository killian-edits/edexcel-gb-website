import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  getAllSubjects,
  getSubjectByCode,
  getComponentsForSubject,
  getBoundariesForSubject,
  getAvailableSeries,
} from '@/lib/supabase/supabase-queries';
import { SubjectCalculatorClient } from '@/components/calculator/subject-calculator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface SubjectPageProps {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  const subjects = await getAllSubjects();
  return subjects.map((s) => ({
    code: s.code.toLowerCase(),
  }));
}

async function SubjectContent({ paramsPromise }: { paramsPromise: Promise<{ code: string }> }) {
  const { code } = await paramsPromise;
  const subject = await getSubjectByCode(code.toUpperCase());

  if (!subject) {
    notFound();
  }

  const initialComponents = await getComponentsForSubject(subject.id);
  const boundaries = await getBoundariesForSubject(subject.id);
  const availableSeries = await getAvailableSeries(subject.id);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0284C7] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all subjects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-0.5 bg-[#F5F5F0] rounded text-[#1A1A1A]">
                {subject.code}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                {subject.title}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-[#6B6B6B]">
              Pearson Edexcel {subject.qualification} ({subject.version} Specification)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {availableSeries.length} Recorded Series
            </Badge>
            {subject.sourceUrl && (
              <a
                href={subject.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#0284C7] hover:underline"
              >
                <span>Official Spec</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main interactive calculator & analytics */}
      <SubjectCalculatorClient
        subject={subject}
        initialComponents={initialComponents}
        boundaries={boundaries}
        availableSeries={availableSeries}
      />
    </div>
  );
}

export default function SubjectPage({ params }: SubjectPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 lg:px-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0284C7] border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-xs font-medium text-[#6B6B6B]">Loading subject calculator...</p>
        </div>
      }
    >
      <SubjectContent paramsPromise={params} />
    </Suspense>
  );
}
