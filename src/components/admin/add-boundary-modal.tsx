'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { addBoundaryDatasetAction } from '@/app/(admin)/admin/actions';
import type { Subject } from '@/types';
import { Plus, X, Layers, CheckCircle2 } from 'lucide-react';

interface AddBoundaryModalProps {
  subjects: Subject[];
}

export function AddBoundaryModal({ subjects }: AddBoundaryModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [series, setSeries] = useState('June');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tier, setTier] = useState<string>('none');
  const [variant, setVariant] = useState('');
  const [componentCode, setComponentCode] = useState('');
  const [maxMark, setMaxMark] = useState<number>(200);
  const [source, setSource] = useState('Verified Pearson Edexcel Publication');
  const [status, setStatus] = useState<'verified' | 'unverified' | 'draft'>('verified');

  // 9-1 thresholds
  const [thresholds, setThresholds] = useState<Record<string, string>>({
    '9': '165',
    '8': '138',
    '7': '111',
    '6': '87',
    '5': '64',
    '4': '41',
    '3': '29',
    '2': '',
    '1': '',
    'U': '0',
  });

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const handleThresholdChange = (grade: string, val: string) => {
    setThresholds((prev) => ({ ...prev, [grade]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!subjectId) {
        throw new Error('Please select a subject');
      }
      if (!series.trim()) {
        throw new Error('Please provide an exam series (e.g. June, November)');
      }
      if (!year || year < 2000 || year > 2100) {
        throw new Error('Please provide a valid examination year');
      }
      if (!maxMark || maxMark <= 0) {
        throw new Error('Maximum mark must be greater than 0');
      }

      const numericThresholds: Record<string, number> = {};
      for (const [grade, val] of Object.entries(thresholds)) {
        if (val !== undefined && val !== '') {
          const num = Number(val);
          if (isNaN(num) || num < 0) {
            throw new Error(`Invalid threshold mark for Grade ${grade}`);
          }
          if (num > maxMark) {
            throw new Error(`Grade ${grade} threshold (${num}) cannot exceed max marks (${maxMark})`);
          }
          numericThresholds[grade] = num;
        }
      }

      if (Object.keys(numericThresholds).length === 0) {
        throw new Error('Please specify at least one grade boundary threshold');
      }

      const res = await addBoundaryDatasetAction({
        subjectId,
        series: series.trim(),
        year: Number(year),
        tier: tier === 'none' ? null : tier,
        variant: variant.trim() ? variant.trim().toUpperCase() : null,
        componentCode: componentCode.trim() || null,
        maxMark: Number(maxMark),
        thresholds: numericThresholds,
        source: source.trim() || 'Official Pearson Edexcel Archive',
        verificationStatus: status,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to add boundary dataset');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Boundary Dataset
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-[#E5E5E5] p-6 space-y-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Add Boundary Dataset</h2>
                  <p className="text-xs text-[#6B6B6B]">Register official 9-1 thresholds for an examination series</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#6B6B6B] hover:text-[#1A1A1A] p-1.5 rounded-lg hover:bg-[#F5F5F0] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="destructive" title="Error registering boundaries">
                <p>{error}</p>
              </Alert>
            )}

            {success && (
              <Alert variant="success" title="Success!">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  Grade boundary archive registered successfully.
                </p>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject & Series details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Target Subject"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    options={subjects.map((s) => ({
                      value: s.id,
                      label: `${s.code} - ${s.title}`,
                    }))}
                  />
                </div>

                <div>
                  <Select
                    label="Exam Series"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    options={[
                      { value: 'June', label: 'June' },
                      { value: 'November', label: 'November' },
                      { value: 'January', label: 'January' },
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Examination Year"
                    type="number"
                    min={2000}
                    max={2100}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Select
                    label="Tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    options={[
                      { value: 'none', label: 'None / Untiered' },
                      { value: 'higher', label: 'Higher Tier' },
                      { value: 'foundation', label: 'Foundation Tier' },
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Paper / Component Code"
                    placeholder="e.g. 1H 2H or 1C 2C"
                    value={componentCode}
                    onChange={(e) => setComponentCode(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Variant (Optional)"
                    placeholder="e.g. R for Regional"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Maximum Scaled / Raw Mark"
                    type="number"
                    min={1}
                    value={maxMark}
                    onChange={(e) => setMaxMark(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Select
                    label="Verification Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    options={[
                      { value: 'verified', label: 'Verified (Published to students)' },
                      { value: 'unverified', label: 'Unverified (Audit required)' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Citation / Official Source Document"
                  placeholder="e.g. grade-boundaries-june-2025-int-gcse.pdf"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>

              {/* Thresholds Grid */}
              <div className="space-y-3 border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Grade Boundary Minimum Threshold Marks (9-1 Scale)
                  </h3>
                  <span className="text-[11px] text-[#6B6B6B]">Scale max: {maxMark}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {['9', '8', '7', '6', '5', '4', '3', '2', '1', 'U'].map((grade) => (
                    <div key={grade} className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-[#1A1A1A]">Grade {grade}</span>
                        {grade === '9' && <span className="text-[10px] text-[#16A34A] font-medium">Top</span>}
                        {grade === '4' && <span className="text-[10px] text-[#0284C7] font-medium">Standard</span>}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={maxMark}
                        placeholder={grade === 'U' ? '0' : 'Mark'}
                        value={thresholds[grade] ?? ''}
                        onChange={(e) => handleThresholdChange(grade, e.target.value)}
                        className="h-8 text-xs font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#E5E5E5] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Boundary Dataset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

