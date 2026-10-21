'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { filterPastPapers } from '@/lib/past-papers/filters';
import type { PastPaper } from '@/types';
import {
  Search,
  BookOpen,
  Calendar,
  FileText,
  FileCheck2,
  Filter,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

interface PastPapersLibraryProps {
  initialPapers: PastPaper[];
  subjects: Array<{ code: string; title: string }>;
}

export function PastPapersLibrary({ initialPapers, subjects }: PastPapersLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedPaperNumber, setSelectedPaperNumber] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Available filter options derived from dataset
  const years = useMemo(() => {
    const list = Array.from(new Set(initialPapers.map((p) => String(p.year)))).sort(
      (a, b) => Number(b) - Number(a)
    );
    return [{ value: 'all', label: 'All Exam Years' }, ...list.map((y) => ({ value: y, label: `Year ${y}` }))];
  }, [initialPapers]);

  const sessions = useMemo(() => {
    return [
      { value: 'all', label: 'All Sessions' },
      { value: 'june', label: 'May / June' },
      { value: 'january', label: 'January' },
      { value: 'november', label: 'November' },
    ];
  }, []);

  const paperNumbers = useMemo(() => {
    const list = Array.from(new Set(initialPapers.map((p) => p.paperNumber))).sort();
    return [{ value: 'all', label: 'All Papers' }, ...list.map((pn) => ({ value: pn, label: `Paper ${pn}` }))];
  }, [initialPapers]);

  const subjectOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Supported Subjects' },
      ...subjects.map((s) => ({ value: s.code, label: `${s.code} – ${s.title}` })),
    ];
  }, [subjects]);

  const filteredPapers = useMemo(() => {
    return filterPastPapers(initialPapers, {
      search,
      subject: selectedSubject,
      year: selectedYear,
      session: selectedSession,
      paperNumber: selectedPaperNumber,
    });
  }, [initialPapers, search, selectedSubject, selectedYear, selectedSession, selectedPaperNumber]);

  const clearFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedYear('all');
    setSelectedSession('all');
    setSelectedPaperNumber('all');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedSubject !== 'all' ||
    selectedYear !== 'all' ||
    selectedSession !== 'all' ||
    selectedPaperNumber !== 'all';

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Toolbar */}
      <Card className="border-[#E5E5E5] bg-white shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search by subject name, paper code (e.g. 4MA1/1H), year, or paper number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-white pl-10 pr-4 text-xs md:text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-xs text-[#9CA3AF] hover:text-[#1A1A1A]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 self-end md:self-auto bg-[#F5F5F0] rounded-lg p-1 border border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0284C7] shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
                title="Table View"
              >
                <TableIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {/* Filter Select Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F5F5F0]">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Subject
              </label>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={subjectOptions}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Exam Year
              </label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Exam Session
              </label>
              <Select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                options={sessions}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B] block mb-1">
                Paper Number
              </label>
              <Select
                value={selectedPaperNumber}
                onChange={(e) => setSelectedPaperNumber(e.target.value)}
                options={paperNumbers}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-1">
            <span>
              Showing <strong className="text-[#1A1A1A]">{filteredPapers.length}</strong> of{' '}
              {initialPapers.length} examination papers
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[#0284C7] hover:underline font-medium"
              >
                Reset all filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results View */}
      {filteredPapers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center space-y-3">
          <BookOpen className="mx-auto h-10 w-10 text-[#6B6B6B]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">No examination papers matched</h3>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            Try adjusting your subject selection, year, or search keyword to find the requested paper.
          </p>
          <Button size="sm" variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const sessionLabel =
              paper.session.charAt(0).toUpperCase() + paper.session.slice(1);

            return (
              <Card
                key={paper.id}
                className="hover:border-[#0284C7]/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#F0F9FF] text-[#0284C7] px-2 py-0.5 rounded border border-[#BAE6FD]">
                          {paper.paperCode}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {sessionLabel} {paper.year}
                        </Badge>
                      </div>

                      <CardTitle className="text-base font-bold text-[#1A1A1A] mt-2">
                        {paper.subjectTitle}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#6B6B6B]">
                        {paper.qualification} • Paper {paper.paperNumber}
                        {paper.tier ? ` (${paper.tier})` : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F0]">
                    <Link
                      href={`/past-papers/${paper.id}`}
                      className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                    >
                      <FileCheck2 className="h-3.5 w-3.5 text-[#16A34A]" />
                      View Mark Scheme
                    </Link>

                    <Link href={`/past-papers/${paper.id}`}>
                      <Button size="sm" className="h-8 text-xs font-semibold">
                        <span>Attempt Paper</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E5E5] text-[#6B6B6B] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Paper Code</th>
                  <th className="py-3 px-4">Year & Session</th>
                  <th className="py-3 px-4">Paper #</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredPapers.map((paper) => {
                  const sessionLabel =
                    paper.session.charAt(0).toUpperCase() + paper.session.slice(1);

                  return (
                    <tr
                      key={paper.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#1A1A1A]">
                        {paper.subjectTitle}
                        <span className="block text-[10px] text-[#6B6B6B]">
                          {paper.qualification}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">
                        {paper.paperCode}
                      </td>
                      <td className="py-3 px-4 text-[#1A1A1A]">
                        {sessionLabel} {paper.year}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                        Paper {paper.paperNumber}
                      </td>
                      <td className="py-3 px-4 capitalize text-[#6B6B6B]">
                        {paper.tier || 'Untiered'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/past-papers/${paper.id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2.5">
                              Mark Scheme
                            </Button>
                          </Link>
                          <Link href={`/past-papers/${paper.id}`}>
                            <Button size="sm" className="h-7 text-xs px-2.5">
                              Attempt
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

