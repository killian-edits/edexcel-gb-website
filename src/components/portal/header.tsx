'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/config/site';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/auth-context';
import { UserNav } from '@/components/portal/user-nav';
import {
  Menu,
  X,
  BarChart3,
  LogIn,
  ShieldAlert,
  User,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-12 lg:px-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#1A1A1A] hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0284C7] text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span>{siteConfig.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-[#0284C7]',
                    isActive ? 'text-[#0284C7] font-semibold' : 'text-[#6B6B6B]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Direct Admin Console Tab if signed-in user is an admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-1.5 text-sm font-bold transition-colors px-2.5 py-1 rounded-md',
                  pathname.startsWith('/admin')
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : 'text-[#DC2626] hover:bg-[#FEF2F2]'
                )}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-24 bg-[#F5F5F0] animate-pulse rounded-lg" />
          ) : user ? (
            <UserNav />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-[#6B6B6B] hover:bg-[#F5F5F0] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="border-b border-[#E5E5E5] bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            {siteConfig.nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'text-sm font-medium py-1.5 transition-colors',
                    isActive ? 'text-[#0284C7] font-semibold' : 'text-[#6B6B6B]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2] rounded-md px-2"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="pt-4 border-t border-[#E5E5E5]">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white">
                        {(profile?.displayName || user.email || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#1A1A1A] truncate max-w-[150px]">
                          {profile?.displayName || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[10px] text-[#6B6B6B] truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin ? (
                      <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Candidate
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] rounded-lg"
                    >
                      <User className="h-4 w-4 text-[#6B6B6B]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-[#1A1A1A] hover:bg-[#F5F5F0] rounded-lg"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#6B6B6B]" />
                      <span>Candidate Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await signOut();
                      }}
                      className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg w-full text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      <LogIn className="h-4 w-4 mr-1.5" />
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
