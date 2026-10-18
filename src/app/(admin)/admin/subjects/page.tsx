import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllSubjects } from '@/lib/supabase/supabase-queries';
import { RegisterSubjectModal } from '@/components/admin/register-subject-modal';

export default async function AdminSubjectsPage() {
  const subjects = await getAllSubjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Subject Configurations</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Maintain syllabuses, tiers, paper allocations, and verified component weightings.
          </p>
        </div>
        <RegisterSubjectModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Specifications</CardTitle>
          <CardDescription className="text-xs">
            Specs available to students on the public portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#6B6B6B]">
                  <th className="py-2.5 font-semibold">Code</th>
                  <th className="py-2.5 font-semibold">Title</th>
                  <th className="py-2.5 font-semibold">Qualification</th>
                  <th className="py-2.5 font-semibold">Tiers</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F0]">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 font-mono font-bold text-[#1A1A1A]">{s.code}</td>
                    <td className="py-2.5 font-medium">{s.title}</td>
                    <td className="py-2.5 text-[#6B6B6B]">{s.qualification} ({s.version})</td>
                    <td className="py-2.5 text-[#6B6B6B]">{s.tiers ? s.tiers.join(', ') : 'None'}</td>
                    <td className="py-2.5">
                      <Badge variant="success" className="text-[10px]">
                        Active
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
