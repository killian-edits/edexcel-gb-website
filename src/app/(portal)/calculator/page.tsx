import { Suspense } from "react";
import Link from "next/link";
import {
  getAllSubjects,
  getAllBoundaries,
} from "@/lib/supabase/supabase-queries";
import { getAllComponents } from "@/lib/data";
import { UnifiedCalculatorClient } from "@/components/calculator/unified-calculator";
import { Calculator, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Grade Boundary Calculator | Edexcel IGCSE",
  description:
    "Select any Edexcel International GCSE subject to calculate mock marks, plan grade targets, and view verified historical boundaries trajectory.",
};

interface CalculatorPageProps {
  searchParams: Promise<{ subject?: string }>;
}

async function CalculatorContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParamsPromise;

  const [subjects, allBoundaries, allComponents] = await Promise.all([
    getAllSubjects(),
    getAllBoundaries(),
    getAllComponents(),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      {/* Header section */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0284C7] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0284C7] text-white">
                <Calculator className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                Grade Boundary Calculator
              </h1>
            </div>
            <p className="text-xs md:text-sm text-[#6B6B6B]">
              Choose any Edexcel International GCSE subject below to calculate
              outcomes, plan target scores, or inspect historical boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Main Unified Calculator Client */}
      <UnifiedCalculatorClient
        subjects={subjects}
        allBoundaries={allBoundaries}
        allComponents={allComponents}
        initialSubjectCode={subject}
      />
    </div>
  );
}

export default function CalculatorPage({ searchParams }: CalculatorPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-6 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0284C7] border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-xs font-medium text-[#6B6B6B]">
            Loading Unified Calculator...
          </p>
        </div>
      }
    >
      <CalculatorContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
