import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldAlert, BookOpen } from 'lucide-react';
import { getResources } from '@/lib/supabase/supabase-queries';

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 lg:px-16 space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
          Authoritative Revision Resources
        </h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Direct references to official Pearson specifications, syllabus checklists, and verified past-paper guidance queried directly from our verified database. We never host unauthorized materials or link to unverified mirrors.
        </p>
      </div>

      <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-[#0284C7] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0369A1] space-y-1">
          <p className="font-semibold">Licensing & Copyright Attribution</p>
          <p>
            All syllabus specifications, examination codes, and assessment frameworks are property of Pearson Education Ltd. BoundaryPulse links directly to public publisher domains for legitimate student preparation.
          </p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-white p-12 text-center space-y-3">
          <BookOpen className="mx-auto h-8 w-8 text-[#6B6B6B]" />
          <h3 className="text-base font-semibold text-[#1A1A1A]">No resources found</h3>
          <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
            Resources are populated from the active subjects and specifications configured in your Supabase database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {item.subjectCode && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F5F0] rounded text-[#1A1A1A]">
                      {item.subjectCode}
                    </span>
                  )}
                  {item.isVerified && (
                    <Badge variant="success" className="text-[10px]">
                      Verified Link
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-3 text-base">{item.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:underline"
                >
                  <span>Access Authoritative Spec</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
