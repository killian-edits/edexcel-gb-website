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
  Lock,
  Timer,
} from 'lucide-react';

interface PaperWorkspaceProps {
  paper: PastPaper;
}

export function PaperWorkspace({ paper }: PaperWorkspaceProps) {
  // Reveal mark scheme state (Hidden by default as requested)
  const [isMarkSchemeRevealed, setIsMarkSchemeRevealed] = useState(false);

  // Mobile active tab ('qp' | 'ms')
  const [mobileTab, setMobileTab] = useState<'qp' | 'ms'>('qp');

  // Parse duration string into total seconds (e.g. "2h" -> 7200, "1h 15m" -> 4500, "3h" -> 10800)
  const parseDurationToSeconds = (dur?: string | null): number => {
    if (!dur) return 7200; // default 2 hours
    let totalSeconds = 0;
    const hoursMatch = dur.match(/(\d+)\s*h/i);
    const minsMatch = dur.match(/(\d+)\s*m/i);
    if (hoursMatch) {
      totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    }
    if (minsMatch) {
      totalSeconds += parseInt(minsMatch[1], 10) * 60;
    }
    return totalSeconds > 0 ? totalSeconds : 7200;
  };

  const initialDurationSeconds = parseDurationToSeconds(paper.duration);

  // Timed Paper state
  const [isTimedPaperMode, setIsTimedPaperMode] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(initialDurationSeconds);

  // Countdown timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartTimedPaper = () => {
    setIsTimedPaperMode(true);
    setIsTimerRunning(true);
    setRemainingSeconds(initialDurationSeconds);
    setIsMarkSchemeRevealed(false);
    setMobileTab('qp');
  };

  const handlePauseResumeTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleEndTimedPaper = () => {
    // End stops timer and unlocks mark scheme. If user starts again, it restarts from beginning.
    setIsTimerRunning(false);
    setIsTimedPaperMode(false);
    setRemainingSeconds(initialDurationSeconds);
  };

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
          {/* Timed Paper Mode & Stopwatch Controls */}
          {!isTimedPaperMode ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTimedPaper}
              className="h-8 text-xs font-semibold border-[#0284C7] text-[#0284C7] hover:bg-[#F0F9FF] shadow-xs"
            >
              <Timer className="h-3.5 w-3.5 mr-1.5" />
              <span>Start Timed Paper ({paper.duration || '2h'})</span>
            </Button>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              isTimerRunning
                ? 'bg-[#FEF2F2] border-[#FECACA]'
                : 'bg-[#FFFBEB] border-[#FDE68A]'
            }`}>
              <span className="flex h-2.5 w-2.5 relative">
                {isTimerRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTimerRunning ? 'bg-red-500' : 'bg-amber-500'}`}></span>
              </span>

              <div className="flex flex-col">
                <span className={`font-mono text-xs font-bold w-16 text-center leading-none ${isTimerRunning ? 'text-red-700' : 'text-amber-800'}`}>
                  {formatTimer(remainingSeconds)}
                </span>
                {!isTimerRunning && (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-700 text-center">
                    Paused
                  </span>
                )}
              </div>

              {/* Pause / Resume Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePauseResumeTimer}
                className={`h-7 px-2 text-xs font-semibold rounded ${
                  isTimerRunning
                    ? 'text-red-700 hover:text-red-900 hover:bg-red-100'
                    : 'text-amber-800 hover:text-amber-900 hover:bg-amber-100'
                }`}
                title={isTimerRunning ? 'Pause countdown' : 'Resume countdown'}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5 mr-1" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </Button>

              {/* End Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEndTimedPaper}
                className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="End exam session and unlock mark scheme"
              >
                End
              </Button>
            </div>
          )}

          {/* Reveal / Hide Mark Scheme Toggle */}
          {isTimedPaperMode ? (
            <div
              className="flex items-center gap-1.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#64748B] px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed select-none"
              title="Mark Scheme is locked while a timed exam paper is in progress. End the timed paper to view answers."
            >
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Mark Scheme Locked</span>
            </div>
          ) : (
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
          )}
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
              if (isTimedPaperMode) return;
              if (!isMarkSchemeRevealed) {
                setIsMarkSchemeRevealed(true);
              }
              setMobileTab('ms');
            }}
            disabled={isTimedPaperMode}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isTimedPaperMode
                ? 'opacity-50 cursor-not-allowed text-[#9CA3AF]'
                : mobileTab === 'ms'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            {isTimedPaperMode ? 'Mark Scheme (Locked)' : `Mark Scheme ${!isMarkSchemeRevealed ? '(Click to Reveal)' : ''}`}
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
          ) : isTimedPaperMode ? (
            <div
              className="w-12 h-full rounded-xl border border-[#FECACA] bg-[#FEF2F2] flex flex-col items-center justify-center p-2 text-center select-none cursor-not-allowed"
              title="Mark Scheme is locked during a timed paper. End the timed session to view answers."
            >
              <div className="rotate-90 whitespace-nowrap text-xs font-bold text-red-600 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 -rotate-90 text-red-500" />
                Locked (Timed Mode)
              </div>
            </div>
          ) : (
            <div
              className="w-12 h-full rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center p-2 text-center group hover:bg-[#F1F5F9] transition-colors cursor-pointer"
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

