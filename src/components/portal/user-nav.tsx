'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  LogOut,
  ShieldAlert,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function UserNav() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const displayName = profile?.displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Candidate';
  const email = user.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full p-1 pl-2 pr-3 text-left transition-colors hover:bg-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer border border-[#E5E5E5] bg-white shadow-2xs"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white shadow-xs">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-[#1A1A1A] leading-tight max-w-[120px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-[#6B6B6B] leading-tight">
            {isAdmin ? 'Administrator' : 'Student'}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[#6B6B6B]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E5E5E5] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User info header */}
          <div className="border-b border-[#F5F5F0] px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{displayName}</p>
              {isAdmin ? (
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-bold uppercase tracking-wider">
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  Candidate
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">{email}</p>
          </div>

          <div className="py-1 space-y-0.5">
            {/* Admin Console Direct Link */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
              >
                <ShieldAlert className="h-4 w-4 text-[#DC2626]" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-[#6B6B6B]" />
              <span>Candidate Dashboard</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors"
            >
              <User className="h-4 w-4 text-[#6B6B6B]" />
              <span>My Profile</span>
            </Link>
          </div>

          <div className="border-t border-[#F5F5F0] pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

