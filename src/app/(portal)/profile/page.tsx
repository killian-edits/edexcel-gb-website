'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  ShieldAlert,
  LogOut,
  Mail,
  Calendar,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, isAdmin, isLoading, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    } else if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name);
    }
  }, [profile, user]);

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Client unavailable');

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 lg:px-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0284C7] border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-xs font-medium text-[#6B6B6B]">Loading candidate profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-[#F5F5F0] text-[#6B6B6B] flex items-center justify-center mx-auto">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Sign in Required</h1>
        <p className="text-xs text-[#6B6B6B]">
          Please sign in to view and manage your candidate profile and exam calculations.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="sm">Sign in to your account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentDisplayName = profile?.displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Candidate';
  const initial = currentDisplayName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10 md:px-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            Account & Profile
          </h1>
          <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">
            Manage your credentials, examination identity, and system access rights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Candidate Dashboard
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="destructive" size="sm">
                <ShieldAlert className="h-4 w-4 mr-1.5" />
                Admin Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {saveSuccess && (
        <Alert variant="success" title="Profile Updated">
          Your candidate name was updated successfully.
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive" title="Update Error">
          {saveError}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0284C7] text-xl font-extrabold text-white shadow-sm shrink-0">
                {initial}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">{currentDisplayName}</h2>
                  {isAdmin ? (
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Student Candidate
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 border-t border-[#E5E5E5] pt-6">
              {/* Display name edit form */}
              {isEditing ? (
                <form onSubmit={handleUpdateDisplayName} className="space-y-3 p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                  <Input
                    label="Display Name / Pseudonym"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter candidate name"
                    required
                  />
                  <div className="flex items-center gap-2 pt-2">
                    <Button type="submit" size="sm" isLoading={isSaving}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                      Candidate Name
                    </span>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{currentDisplayName}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-[#E5E5E5] space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#6B6B6B] flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-[#0284C7]" />
                    Email Status
                  </span>
                  <p className="font-medium text-[#1A1A1A]">
                    {user.email_confirmed_at ? 'Verified Official' : 'Unconfirmed'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E5E5E5] space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#6B6B6B] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#16A34A]" />
                    Registered Since
                  </span>
                  <p className="font-medium text-[#1A1A1A]">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E5E5E5] space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-semibold uppercase text-[#6B6B6B] flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-[#D97706]" />
                    Candidate Account ID
                  </span>
                  <p className="font-mono text-[#6B6B6B] break-all">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Privileges & Session Actions */}
        <div className="space-y-6">
          {/* Admin privilege banner if user is an admin */}
          {isAdmin && (
            <Card className="border-[#DC2626]/30 bg-[#FEF2F2]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Admin Privileges Active
                </CardTitle>
                <CardDescription className="text-xs text-[#B91C1C]">
                  Your profile has administrator role verification, granting full authority to add boundary archives and register specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button variant="destructive" size="sm" className="w-full justify-between">
                    <span>Open Admin Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick links & Session Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Session</CardTitle>
              <CardDescription className="text-xs">
                Terminate active browser session or switch accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full text-[#DC2626] border-[#DC2626]/30 hover:bg-[#FEF2F2] hover:text-[#B91C1C] justify-center"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

