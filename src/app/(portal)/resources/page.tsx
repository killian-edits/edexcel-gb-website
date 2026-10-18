import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookCheck, FileText, CheckCircle, ShieldAlert } from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  subjectCode: string;
  type: 'checklist' | 'formula' | 'specification';
  description: string;
  url: string;
  verified: boolean;
}

const resources: ResourceItem[] = [
  {
    id: 'res-4ma1-spec',
    title: 'Edexcel International GCSE Mathematics A Specification (Issue 5)',
    subjectCode: '4MA1',
    type: 'specification',
    description: 'Official Pearson syllabus, exam format definitions, and component weighting structure.',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/mathematics-a-2016.html',
    verified: true,
  },
  {
    id: 'res-4ch1-spec',
    title: 'Edexcel International GCSE Chemistry Specification (Issue 3)',
    subjectCode: '4CH1',
    type: 'specification',
    description: 'Complete syllabus breakdown covering Principles of Chemistry, Inorganic, Physical, and Organic modules.',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/chemistry-2017.html',
    verified: true,
  },
  {
    id: 'res-4ph2-spec',
    title: 'Edexcel International GCSE Physics Specification',
    subjectCode: '4PH2',
    type: 'specification',
    description: 'Detailed assessment overview for Paper 1P and Paper 2P examination components.',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/physics-2017.html',
    verified: true,
  },
  {
    id: 'res-4bi1-spec',
    title: 'Edexcel International GCSE Biology Specification',
    subjectCode: '4BI1',
    type: 'specification',
    description: 'Curriculum structure, core practical requirements, and examination weighting guidelines.',
    url: 'https://qualifications.pearson.com/en/qualifications/edexcel-international-gcses/biology-2017.html',
    verified: true,
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 lg:px-16 space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
          Authoritative Revision Resources
        </h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Direct references to official Pearson specifications, syllabus checklists, and verified past-paper guidance. We never host unauthorized materials or link to unverified mirrors.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F5F0] rounded text-[#1A1A1A]">
                  {item.subjectCode}
                </span>
                <Badge variant="success" className="text-[10px]">
                  Verified Link
                </Badge>
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
    </div>
  );
}

