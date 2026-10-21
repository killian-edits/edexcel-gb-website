"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { isSupabaseConfigured } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/client";
import { saveCandidateSubjectsAction } from "@/app/(admin)/admin/actions";
import type { Subject } from "@/types";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  User,
  ArrowRight,
  Calculator,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const configured = isSupabaseConfigured();

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManaging, setIsManaging] = useState(false);
  const [unenrollSubjectCode, setUnenrollSubjectCode] = useState<string | null>(
    null,
  );

  // Sync selected codes from profile when profile loads
  useEffect(() => {
    if (profile?.chosenSubjects) {
      setSelectedCodes(profile.chosenSubjects);
    }
  }, [profile]);

  // Load all supported/verified subjects from Supabase
  useEffect(() => {
    async function fetchSubjects() {
      try {
        setIsLoadingSubjects(true);
        const supabase = createClient();
        if (!supabase) {
          setIsLoadingSubjects(false);
          setInitialLoaded(true);
          return;
        }

        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("status", "verified")
          .order("title", { ascending: true });

        if (!error && data) {
          const mapped: Subject[] = data.map((row: any) => ({
            id: row.id,
            code: row.code,
            title: row.title,
            qualification: row.qualification,
            version: row.version,
            tiers: row.tiers,
            status: row.status,
            sourceUrl: row.source_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setAllSubjects(mapped);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setIsLoadingSubjects(false);
        setInitialLoaded(true);
      }
    }

    fetchSubjects();
  }, []);

  const toggleSubject = (code: string) => {
    const upper = code.toUpperCase();
    setSelectedCodes((prev) =>
      prev.includes(upper) ? prev.filter((c) => c !== upper) : [...prev, upper],
    );
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSaveSelections = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await saveCandidateSubjectsAction(selectedCodes);
      if (!res.success) {
        throw new Error(res.error || "Failed to save selected subjects");
      }

      setSaveSuccess(true);
      await refreshProfile();
      setIsManaging(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnenroll = async (code: string) => {
    if (!user) return;
    const upper = code.toUpperCase();
    const updated = selectedCodes.filter((c) => c !== upper);
    setUnenrollSubjectCode(upper);
    setSaveError(null);

    try {
      const res = await saveCandidateSubjectsAction(updated);
      if (!res.success) {
        throw new Error(res.error || "Failed to unenroll from subject");
      }
      setSelectedCodes(updated);
      await refreshProfile();
    } catch (err: any) {
      setSaveError(err.message || "Failed to unenroll from subject");
    } finally {
      setUnenrollSubjectCode(null);
    }
  };

  const displayName =
    profile?.displayName ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const chosenSubjectsList = allSubjects.filter((s) =>
    selectedCodes.includes(s.code.toUpperCase()),
  );

  const filteredCatalog = allSubjects.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.code.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.qualification.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-12 lg:px-16 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Candidate Dashboard
            </h1>
            {user &&
              (isAdmin ? (
                <Badge
                  variant="destructive"
                  className="text-xs uppercase font-bold tracking-wider"
                >
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Candidate
                </Badge>
              ))}
          </div>
          <p className="text-xs md:text-sm text-[#6B6B6B] mt-1">
            {user
              ? `Welcome back, ${displayName}. Manage and track your chosen Pearson Edexcel IGCSE subjects.`
              : "Sign in to choose and track your Pearson Edexcel IGCSE subjects."}
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
              <Calculator className="h-4 w-4 mr-1.5" />
              Calculator
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
              <p className="text-sm font-bold text-[#1A1A1A]">
                Administrator Workspace Access
              </p>
              <p className="text-xs text-[#6B6B6B]">
                You have administrative access to publish grade boundaries and
                register subjects.
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button
              variant="destructive"
              size="sm"
              className="whitespace-nowrap"
            >
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
              Supabase environment variables are currently unconfigured.
              Connecting Supabase allows persisting your selected subjects to
              your profile.
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {saveSuccess && (
        <Alert variant="success" title="Subjects Saved">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
            <span>
              Your chosen IGCSE subjects have been saved to your profile and
              will be remembered on your future visits.
            </span>
          </div>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive" title="Error Saving Subjects">
          <p>{saveError}</p>
        </Alert>
      )}

      {/* Main Content Area: Chosen Subjects & Management */}
      {!user ? (
        <Card className="text-center py-12 px-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#F5F5F0] flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-[#6B6B6B]" />
          </div>
          <CardTitle className="text-xl font-bold text-[#1A1A1A]">
            Account Required
          </CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            Sign in to select and save your IGCSE subjects. Your subject choices
            will be linked directly to your profile.
          </CardDescription>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#0284C7]" />
                Your IGCSE Subjects
                <Badge variant="outline" className="ml-1 text-xs">
                  {selectedCodes.length}{" "}
                  {selectedCodes.length === 1 ? "Subject" : "Subjects"}
                </Badge>
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-1">
                The subjects you are enrolled in. Only official supported
                specifications stored in the database are selectable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isManaging ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsManaging(!isManaging)}
              >
                <Settings2 className="h-4 w-4 mr-1.5" />
                {isManaging ? "Done Selecting" : "Choose / Edit Subjects"}
              </Button>
            </div>
          </div>

          {/* Subject Selection / Management Drawer */}
          {isManaging && (
            <Card className="border-[#0284C7]/30 bg-[#F0F9FF]/40 animate-in fade-in duration-200">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-[#0369A1]">
                      Select Supported Pearson Edexcel Subjects
                    </CardTitle>
                    <CardDescription className="text-xs text-[#6B6B6B]">
                      Click on the subjects you are taking. Once finished, click
                      &quot;Save Choices&quot; to update your profile.
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#E5E5E5] bg-white pl-9 pr-3 text-xs placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isLoadingSubjects ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <p className="text-xs text-[#6B6B6B] py-6 text-center">
                    {searchQuery
                      ? "No supported subjects match your search."
                      : "No verified subjects found in the database."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {filteredCatalog.map((subj) => {
                      const isSelected = selectedCodes.includes(
                        subj.code.toUpperCase(),
                      );
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => toggleSubject(subj.code)}
                          className={`flex items-start justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0284C7] bg-[#E0F2FE] shadow-xs"
                              : "border-[#E5E5E5] bg-white hover:border-[#CBD5E1] hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-[#1A1A1A]">
                                {subj.code}
                              </span>
                              <span className="text-[10px] text-[#6B6B6B]">
                                ({subj.version})
                              </span>
                            </div>
                            <p className="text-xs font-medium text-[#1A1A1A] line-clamp-1">
                              {subj.title}
                            </p>
                            <p className="text-[10px] text-[#6B6B6B]">
                              {subj.qualification}
                            </p>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#0284C7] border-[#0284C7] text-white"
                                : "border-[#D1D5DB] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xs text-[#6B6B6B]">
                    {selectedCodes.length} subject
                    {selectedCodes.length !== 1 ? "s" : ""} currently selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsManaging(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSelections}
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Save Choices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidate's Enrolled Subjects Display */}
          {isLoadingSubjects || !initialLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : chosenSubjectsList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFAFA] p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1A]">
                  No Subjects Chosen Yet
                </h3>
                <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
                  Select the Pearson Edexcel IGCSE subjects you are taking. They
                  will be saved to your profile and displayed here for quick
                  access to boundaries and calculations.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsManaging(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Choose Your Subjects
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chosenSubjectsList.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:border-[#0284C7]/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                          {subject.code}
                        </span>
                        <CardTitle className="text-base font-bold text-[#1A1A1A] mt-2">
                          {subject.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-[#6B6B6B]">
                          {subject.qualification} • {subject.version}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider text-[#16A34A] border-[#BBF7D0] bg-[#F0FDF4]"
                      >
                        Enrolled
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-[#F5F5F0]">
                      <Link
                        href={`/subjects/${subject.code.toLowerCase()}`}
                        className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                      >
                        View Specification
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/calculator?subject=${encodeURIComponent(subject.code)}`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5"
                          >
                            <Calculator className="h-3 w-3 mr-1" />
                            Calculate
                          </Button>
                        </Link>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUnenroll(subject.code)}
                          disabled={
                            unenrollSubjectCode === subject.code.toUpperCase()
                          }
                          title="Unenroll from subject"
                          className="h-7 text-xs px-2.5 text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
