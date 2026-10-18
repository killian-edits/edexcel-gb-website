import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">User Directory & Access Control</h1>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Review registered candidate accounts and security privileges. Minimal student personal data is stored.
        </p>
      </div>

      <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#16A34A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#15803D] space-y-1">
          <p className="font-semibold">Privacy-First Architecture</p>
          <p>
            Candidate mock scores are isolated by Row Level Security (RLS). Passwords and private tokens are managed solely by Supabase Auth and never exposed in application logs or admin tables.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Roles & Accounts</CardTitle>
          <CardDescription className="text-xs">
            Privileged roles are restricted by database-level security policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#6B6B6B]">
                  <th className="py-2.5 font-semibold">Account Identifier</th>
                  <th className="py-2.5 font-semibold">Role</th>
                  <th className="py-2.5 font-semibold">Access Scope</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F0]">
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 font-medium text-[#1A1A1A]">System Root Administrator</td>
                  <td className="py-2.5">
                    <Badge variant="default" className="text-[10px]">
                      admin
                    </Badge>
                  </td>
                  <td className="py-2.5 text-[#6B6B6B]">Full Schema & Boundary Audit</td>
                  <td className="py-2.5">
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  </td>
                </tr>
                <tr className="hover:bg-[#FAFAFA]">
                  <td className="py-2.5 font-medium text-[#1A1A1A]">Default Candidate Tier</td>
                  <td className="py-2.5">
                    <Badge variant="secondary" className="text-[10px]">
                      customer
                    </Badge>
                  </td>
                  <td className="py-2.5 text-[#6B6B6B]">Own Saved Calculations Only</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="text-[10px]">
                      Sandboxed
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

