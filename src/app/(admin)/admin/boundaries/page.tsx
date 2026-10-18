import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBoundaries } from '@/lib/supabase/supabase-queries';
import { formatSeries } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default async function AdminBoundariesPage() {
  const boundaries = await getAllBoundaries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Grade Boundary Archives</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Review, audit, or register verified Pearson Edexcel examination series boundary tables.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Boundary Dataset
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Registered Datasets</CardTitle>
            <CardDescription className="text-xs">
              All active boundaries used in public candidate score projections
            </CardDescription>
          </div>
          <Badge variant="outline">
            {boundaries.length} Total Sets
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-[#6B6B6B]">
                  <th className="py-2.5 font-semibold">Subject Ref</th>
                  <th className="py-2.5 font-semibold">Series</th>
                  <th className="py-2.5 font-semibold">Tier</th>
                  <th className="py-2.5 font-semibold">Threshold Samples (A* / A / C)</th>
                  <th className="py-2.5 font-semibold">Max Marks</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F0]">
                {boundaries.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAFAFA]">
                    <td className="py-2.5 font-mono font-medium text-[#1A1A1A]">{b.subjectId}</td>
                    <td className="py-2.5 font-medium">{formatSeries(b.series)}</td>
                    <td className="py-2.5 text-[#6B6B6B] capitalize">{b.tier || 'Untiered'}</td>
                    <td className="py-2.5 font-mono text-[#6B6B6B]">
                      {b.thresholds['A*'] ?? '-'} / {b.thresholds['A'] ?? '-'} / {b.thresholds['C'] ?? '-'}
                    </td>
                    <td className="py-2.5 font-mono">{b.maxMark}</td>
                    <td className="py-2.5">
                      <Badge variant="success" className="text-[10px]">
                        Published
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
