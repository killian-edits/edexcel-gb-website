'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/lib/auth/auth-context';
import { isSupabaseConfigured } from '@/lib/config/env';
import {
  Calculator,
  Plus,
  ShieldCheck,
  ShieldAlert,
  User,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const configured = isSupabaseConfigured();

  const displayName = profile?.displayName || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Candidate';

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Candidate Dashboard
            </h1>
            {user && (
              isAdmin ? (
                <Badge variant="destructive" className="text-xs uppercase font-bold tracking-wider">
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Candidate
                </Badge>
              )
            )}
          </div>
          <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">
            {user ? `Welcome back, ${displayName}. Manage your saved practice calculations and forecasts.` : 'Manage your saved practice calculations and target forecasts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="destructive" size="sm">
                <ShieldAlert className="h-4 w-4 mr-1.5" />
                Admin Console
              </Button>
            </Link>
          )}

          {user && (
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-1.5" />
                Profile
              </Button>
            </Link>
          )}

          <Link href="/calculator">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Calculation
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Quick Jump Banner */}
      {isAdmin && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#DC2626] text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">Administrator Workspace Access</p>
              <p className="text-xs text-[#6B6B6B]">
                You have administrative access to publish grade boundaries and register subjects.
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="destructive" size="sm" className="whitespace-nowrap">
              <span>Go to Admin Console</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

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

      {/* Main Empty State / Calculations Placeholder */}
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
