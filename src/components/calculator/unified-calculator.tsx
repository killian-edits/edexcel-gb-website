'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Subject, SubjectComponent, GradeBoundary } from '@/types';
import { SubjectCalculatorClient } from '@/components/calculator/subject-calculator';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

interface UnifiedCalculatorClientProps {
  subjects: Subject[];
  allBoundaries: GradeBoundary[];
  allComponents: SubjectComponent[];
  initialSubjectCode?: string;
}

export function UnifiedCalculatorClient({
  subjects,
  allBoundaries,
  allComponents,
  initialSubjectCode,
}: UnifiedCalculatorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Find initial subject from query parameter or prop, defaulting to first subject if available
  const initialSelected = subjects.find(
    (s) => s.code.toUpperCase() === (initialSubjectCode || searchParams.get('subject') || '').toUpperCase()
  ) || subjects[0] || null;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSelected ? initialSelected.id : ''
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || null;

  // Filter components and boundaries for the selected subject
  const currentComponents = selectedSubject
    ? allComponents.filter((c) => c.subjectId === selectedSubject.id)
    : [];

  const currentBoundaries = selectedSubject
    ? allBoundaries.filter((b) => b.subjectId === selectedSubject.id)
    : [];

  // Available series labels for this subject
  const sortedBoundaries = [...currentBoundaries].sort((a, b) => (b.year || 0) - (a.year || 0));
  const availableSeries = [
    ...new Set(
      sortedBoundaries.map((b) =>
        b.year && !b.series.includes(String(b.year)) ? `${b.series} ${b.year}` : b.series
      )
    ),
  ];

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const chosen = subjects.find((s) => s.id === subjectId);
    if (chosen) {
      startTransition(() => {
        router.replace(`/calculator?subject=${encodeURIComponent(chosen.code)}`, { scroll: false });
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Subject Selector & Metadata Card */}
      <Card className="border-[#0284C7]/20 bg-gradient-to-r from-[#F0F9FF]/60 via-white to-[#F5F5F0]/60 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="w-full md:max-w-md space-y-2">
              <label
                htmlFor="subject-select"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0369A1]"
              >
                <BookOpen className="h-4 w-4 text-[#0284C7]" />
                <span>Select Examination Subject</span>
              </label>
              <Select
                id="subject-select"
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                options={subjects.map((s) => ({
                  value: s.id,
                  label: `${s.code} — ${s.title} (${s.qualification})`,
                }))}
                className="bg-white border-[#BAE6FD] font-medium text-base h-11"
              />
              <p className="text-[11px] text-[#6B6B6B]">
                Switch subjects anytime. Raw papers, verified boundaries, and scales update dynamically.
              </p>
            </div>

            {selectedSubject && (
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#F5F5F0] rounded text-[#1A1A1A]">
                    {selectedSubject.code}
                  </span>
                  <Badge variant="success" className="text-xs">
                    Verified Spec
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {availableSeries.length} Sessions Available
                  </Badge>
                </div>

                {selectedSubject.sourceUrl && (
                  <a
                    href={selectedSubject.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0284C7] hover:underline ml-1"
                  >
                    <span>Official Spec</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Render Calculator for Selected Subject */}
      {selectedSubject ? (
        <div key={selectedSubject.id} className="transition-opacity duration-200">
          <SubjectCalculatorClient
            subject={selectedSubject}
            initialComponents={currentComponents}
            boundaries={currentBoundaries}
            availableSeries={availableSeries}
          />
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F9FF] text-[#0284C7] mb-4">
            <Calculator className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">No Subject Selected</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2 text-xs text-[#6B6B6B]">
            Please select a Pearson Edexcel IGCSE subject from the dropdown above to load component papers, score calculators, and historical trends.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}

