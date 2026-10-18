import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import { getAllSubjects } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowRight, ShieldCheck, CheckCircle2, Search, TrendingUp, Layers } from 'lucide-react';

export default async function HomePage() {
  const subjects = await getAllSubjects();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E5E5E5] bg-gradient-to-b from-[#F5F5F0] to-[#FAFAFA] py-20 px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#F0F9FF] px-3 py-1 text-xs font-semibold text-[#0284C7]">
              <ShieldCheck className="h-4 w-4" />
              <span>Strict Data Integrity & Deterministic Calculations</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1A1A1A] leading-[1.1]">
              Accurate, verified Edexcel IGCSE grade analytics.
            </h1>

            <p className="text-lg md:text-xl text-[#6B6B6B] leading-relaxed">
              Calculate practice outcomes, plan remaining targets, and explore historical series trends with mathematically verified component weightings.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="#subjects">
                <Button size="lg" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Explore Subjects
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" size="lg">
                  Revision Checklists
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Principles Grid */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-3 border-none">
              <div className="h-10 w-10 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">No Interpolation or Guessing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                We never guess boundaries, interpolate unreleased series, or silently substitute data. Missing boundaries return a clear typed unavailable state.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3 border-none">
              <div className="h-10 w-10 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Component Aggregation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Components, paper weightings, scaling factors, and tier limits are faithfully modeled to Pearson Edexcel's exact specifications.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3 border-none">
              <div className="h-10 w-10 rounded-lg bg-[#F5F5F0] text-[#1A1A1A] flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Target Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Enter finished mock marks to calculate exactly what is required on upcoming papers, with impossible targets flagged immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Subjects Section */}
      <section id="subjects" className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Supported Subjects
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Select a specification to run mock grade calculations or analyze past boundary shifts.
            </p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto py-1 px-3">
            {subjects.length} Verified Specifications
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="flex flex-col hover:border-[#0284C7] transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-[#F5F5F0] rounded text-[#1A1A1A]">
                    {subject.code}
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Verified Spec
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg">{subject.title}</CardTitle>
                <CardDescription>
                  {subject.qualification} ({subject.version})
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="text-xs text-[#6B6B6B]">
                  {subject.tiers ? (
                    <span className="inline-block bg-[#F5F5F0] px-2 py-0.5 rounded text-[11px] font-medium text-[#1A1A1A]">
                      Tiers: {subject.tiers.join(', ')}
                    </span>
                  ) : (
                    <span className="inline-block bg-[#F5F5F0] px-2 py-0.5 rounded text-[11px] font-medium text-[#1A1A1A]">
                      Untiered specification
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] line-clamp-2">
                  Component marks, paper weightings, and published series thresholds.
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <Link href={`/subjects/${subject.code}`} className="w-full">
                  <Button variant="secondary" className="w-full justify-between">
                    <span>Open Calculator</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Educational Notice Banner */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16 w-full">
        <div className="rounded-xl border border-[#E5E5E5] bg-[#F5F5F0] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Notice regarding historical boundaries
            </h3>
            <p className="text-xs md:text-sm text-[#6B6B6B] max-w-2xl leading-relaxed">
              Grade boundaries fluctuate every exam series based on paper difficulty and cohort performance standards set by Pearson Edexcel. Past boundary calculations provide realistic reference targets but are never an official guarantee of future outcomes.
            </p>
          </div>
          <Link href="/resources" className="shrink-0">
            <Button variant="outline" size="sm">
              Read Methodology
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

