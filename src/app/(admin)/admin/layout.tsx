export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import {
  BarChart3,
  Layers,
  BookOpen,
  Users,
  ArrowLeft,
  User,
} from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  // If Supabase client is not available or configured, redirect to login
  if (!supabase) {
    redirect('/login');
  }

  // 1. Authenticate user server-side
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. Query public.profiles for the matching user id and verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[#E5E5E5] bg-white flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-[#E5E5E5]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0284C7] text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#1A1A1A] block leading-tight">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-[#0284C7] font-semibold uppercase tracking-wider block">
                Admin Console
              </span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F0] transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-[#6B6B6B]" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              href="/admin/boundaries"
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#6B6B6B] rounded-lg hover:bg-[#F5F5F0] hover:text-[#1A1A1A] transition-colors"
            >
              <Layers className="h-4 w-4 text-[#6B6B6B]" />
              <span>Grade Boundaries</span>
            </Link>

            <Link
              href="/admin/subjects"
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#6B6B6B] rounded-lg hover:bg-[#F5F5F0] hover:text-[#1A1A1A] transition-colors"
            >
              <BookOpen className="h-4 w-4 text-[#6B6B6B]" />
              <span>Subjects & Specs</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#6B6B6B] rounded-lg hover:bg-[#F5F5F0] hover:text-[#1A1A1A] transition-colors"
            >
              <Users className="h-4 w-4 text-[#6B6B6B]" />
              <span>User Accounts</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-[#E5E5E5] space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Public Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
