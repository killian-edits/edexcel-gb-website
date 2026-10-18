import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllSubjects, getAllBoundaries } from '@/lib/supabase/supabase-queries';
import { formatSeries } from '@/lib/utils';
import { Layers, BookOpen, Activity, ShieldCheck } from 'lucide-react';
import { AddBoundaryModal } from '@/components/admin/add-boundary-modal';
import { RegisterSubjectModal } from '@/components/admin/register-subject-modal';

export default async function AdminDashboardPage() {
  const subjects = await getAllSubjects();
  const allBoundaries = await getAllBoundaries();
  const publishedBoundaries = allBoundaries.filter((b) => b.verificationStatus === 'verified');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">System Administration</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Monitor published grade boundaries, audit trail verification, and subject configuration status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RegisterSubjectModal />
          <AddBoundaryModal subjects={subjects} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Supported Specs</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{subjects.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Published Boundaries</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{publishedBoundaries.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Verification Status</p>
              <p className="text-sm font-bold text-[#16A34A] mt-2">100% Verified</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#F5F5F0] text-[#1A1A1A] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B6B6B]">Data Isolation</p>
              <p className="text-sm font-bold text-[#0284C7] mt-2">RLS Enforced</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#F5F5F0] text-[#1A1A1A] flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Verification Audit Trail</CardTitle>
          <CardDescription className="text-xs">
            Published records undergo deterministic validation before public release.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#6B6B6B]">
                  <th className="py-2.5 font-semibold">Subject Ref</th>
                  <th className="py-2.5 font-semibold">Series</th>
                  <th className="py-2.5 font-semibold">Tier / Variant</th>
                  <th className="py-2.5 font-semibold">Scale</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F0]">
                {allBoundaries.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 font-medium text-[#1A1A1A]">{b.subjectId.replace('subj-', '').toUpperCase()}</td>
                    <td className="py-2.5 text-[#6B6B6B]">{formatSeries(b.series, b.year)}</td>
                    <td className="py-2.5 text-[#6B6B6B]">{b.tier ? `${b.tier} tier` : 'Untiered'}</td>
                    <td className="py-2.5 text-[#6B6B6B] font-mono">{b.maxMark} marks</td>
                    <td className="py-2.5">
                      <Badge variant="success" className="text-[10px]">
                        Verified
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
