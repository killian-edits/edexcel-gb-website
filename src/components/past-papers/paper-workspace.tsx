'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PDFViewer } from './pdf-viewer';
import type { PastPaper } from '@/types';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  FileCheck2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Split,
  Columns,
  Sparkles,
} from 'lucide-react';

interface PaperWorkspaceProps {
  paper: PastPaper;
}

export function PaperWorkspace({ paper }: PaperWorkspaceProps) {
  // Reveal mark scheme state (Hidden by default as requested)
  const [isMarkSchemeRevealed, setIsMarkSchemeRevealed] = useState(false);

  // Mobile active tab ('qp' | 'ms')
  const [mobileTab, setMobileTab] = useState<'qp' | 'ms'>('qp');

  // Exam Practice Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedSession =
    paper.session.charAt(0).toUpperCase() + paper.session.slice(1);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-[1720px] mx-auto px-3 sm:px-6 py-3 space-y-3">
      {/* Top Navigation & Workspace Header */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/past-papers">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Papers</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-[#E5E5E5] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-[#F0F9FF] text-[#0284C7] px-2 py-0.5 rounded border border-[#BAE6FD]">
                {paper.paperCode}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#1A1A1A] truncate max-w-[200px] sm:max-w-md">
                {paper.subjectTitle}
              </h1>
              <Badge variant="outline" className="text-[10px] hidden md:inline-flex capitalize">
                {formattedSession} {paper.year}
              </Badge>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5 hidden sm:block">
              {paper.qualification} • Paper {paper.paperNumber}
              {paper.tier ? ` (${paper.tier} Tier)` : ''}
            </p>
          </div>
        </div>

        {/* Right side tools: Timer & Mark Scheme Toggle */}
        <div className="flex items-center gap-2">
          {/* Practice Timer */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-mono text-xs font-semibold text-slate-700 w-14 text-center">
              {formatTimer(timerSeconds)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900"
              title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isTimerRunning ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
            </Button>
            {timerSeconds > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                title="Reset Timer"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Reveal / Hide Mark Scheme Toggle */}
          <Button
            size="sm"
            variant={isMarkSchemeRevealed ? 'secondary' : 'primary'}
            onClick={() => {
              const next = !isMarkSchemeRevealed;
              setIsMarkSchemeRevealed(next);
              if (next) setMobileTab('ms');
            }}
            className="h-8 text-xs font-semibold"
          >
            {isMarkSchemeRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1.5 text-[#DC2626]" />
                Hide Mark Scheme
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Reveal Mark Scheme
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden rounded-lg bg-[#F5F5F0] p-1 border border-[#E5E5E5] shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('qp')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mobileTab === 'qp'
              ? 'bg-white text-[#0284C7] shadow-xs'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          Question Paper
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isMarkSchemeRevealed) {
              setIsMarkSchemeRevealed(true);
            }
            setMobileTab('ms');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mobileTab === 'ms'
              ? 'bg-white text-[#16A34A] shadow-xs'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          Mark Scheme {!isMarkSchemeRevealed && '(Click to Reveal)'}
        </button>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 min-h-0 w-full">
        {/* Desktop Split View: Question Paper on Left (slightly more width: 55-60%), Mark Scheme on Right */}
        <div className="hidden md:flex h-full w-full gap-3">
          {/* Question Paper Panel */}
          <div
            className={`h-full transition-all duration-200 flex flex-col ${
              isMarkSchemeRevealed ? 'w-[58%]' : 'w-full'
            }`}
          >
            <PDFViewer
              title={`${paper.subjectTitle} (${paper.paperCode})`}
              type="question_paper"
              pdfUrl={paper.questionPaperUrl}
              storagePath={paper.questionPaperPath}
              paperCode={paper.paperCode}
            />
          </div>

          {/* Mark Scheme Panel (revealed or collapsed) */}
          {isMarkSchemeRevealed ? (
            <div className="h-full w-[42%] flex flex-col transition-all duration-200 animate-in fade-in">
              <PDFViewer
                title={`Mark Scheme - ${paper.paperCode}`}
                type="mark_scheme"
                pdfUrl={paper.markSchemeUrl}
                storagePath={paper.markSchemePath}
                paperCode={paper.paperCode}
              />
            </div>
          ) : (
            <div className="w-12 h-full rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center p-2 text-center group hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              onClick={() => setIsMarkSchemeRevealed(true)}
              title="Click to Reveal Mark Scheme"
            >
              <div className="rotate-90 whitespace-nowrap text-xs font-semibold text-[#64748B] group-hover:text-[#0284C7] flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 -rotate-90" />
                Reveal Mark Scheme
              </div>
            </div>
          )}
        </div>

        {/* Mobile View (Tabbed) */}
        <div className="flex md:hidden h-full w-full">
          {mobileTab === 'qp' ? (
            <div className="h-full w-full flex flex-col">
              <PDFViewer
                title={`${paper.subjectTitle} (${paper.paperCode})`}
                type="question_paper"
                pdfUrl={paper.questionPaperUrl}
                storagePath={paper.questionPaperPath}
                paperCode={paper.paperCode}
              />
            </div>
          ) : (
            <div className="h-full w-full flex flex-col">
              {isMarkSchemeRevealed ? (
                <PDFViewer
                  title={`Mark Scheme - ${paper.paperCode}`}
                  type="mark_scheme"
                  pdfUrl={paper.markSchemeUrl}
                  storagePath={paper.markSchemePath}
                  paperCode={paper.paperCode}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-xl border border-[#E5E5E5] space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">Mark Scheme Hidden</h3>
                  <p className="text-xs text-[#6B6B6B] max-w-xs">
                    Mark schemes are concealed during exam practice to encourage independent solving.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setIsMarkSchemeRevealed(true)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Reveal Mark Scheme
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

