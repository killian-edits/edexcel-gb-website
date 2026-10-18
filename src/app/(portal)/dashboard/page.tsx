'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { isSupabaseConfigured } from '@/lib/config/env';
import { Calculator, Plus, Bookmark, Clock, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            Candidate Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">
            Manage your saved practice calculations and target forecasts
          </p>
        </div>

        <Link href="/#subjects">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New Calculation
          </Button>
        </Link>
      </div>

      {!configured && (
        <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[#0284C7] shrink-0 mt-0.5" />
          <div className="text-xs text-[#0369A1] space-y-1">
            <p className="font-semibold">Local Session Mode</p>
            <p>
              Supabase environment variables are currently unconfigured. Calculations performed on subject pages operate with complete deterministic precision in memory, but cloud synchronization across devices requires database keys.
            </p>
          </div>
        </div>
      )}

      <EmptyState
        icon={<Calculator className="h-8 w-8 text-[#6B6B6B]" />}
        title="No saved calculations yet"
        description="Run a mock mark calculation on any verified subject page to store and compare outcomes here."
        actionLabel="Browse Subjects"
        onAction={() => {
          window.location.href = '/#subjects';
        }}
      />
    </div>
  );
}
