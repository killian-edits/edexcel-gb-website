'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { registerSubjectAction } from '@/app/(admin)/admin/actions';
import { Plus, X, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';

interface ComponentInputRow {
  componentCode: string;
  componentName: string;
  maxRawMarks: number;
  duration: string;
  weightingPercent: number;
}

export function RegisterSubjectModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [qualification, setQualification] = useState('International GCSE');
  const [version, setVersion] = useState('2017');
  const [hasTiers, setHasTiers] = useState(false);
  const [tiers, setTiers] = useState<string[]>(['Higher', 'Foundation']);
  const [status, setStatus] = useState<'verified' | 'unverified' | 'draft'>('verified');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');

  // Components State
  const [components, setComponents] = useState<ComponentInputRow[]>([
    {
      componentCode: '1',
      componentName: 'Paper 1',
      maxRawMarks: 100,
      duration: '2h',
      weightingPercent: 50,
    },
    {
      componentCode: '2',
      componentName: 'Paper 2',
      maxRawMarks: 100,
      duration: '2h',
      weightingPercent: 50,
    },
  ]);

  const handleAddComponent = () => {
    const nextIdx = components.length + 1;
    setComponents((prev) => [
      ...prev,
      {
        componentCode: String(nextIdx),
        componentName: `Paper ${nextIdx}`,
        maxRawMarks: 100,
        duration: '2h',
        weightingPercent: 50,
      },
    ]);
  };

  const handleRemoveComponent = (idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleComponentChange = (
    idx: number,
    field: keyof ComponentInputRow,
    value: any
  ) => {
    setComponents((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!code.trim()) {
        throw new Error('Subject code is required (e.g. 4BI1)');
      }
      if (!title.trim()) {
        throw new Error('Subject title is required (e.g. Biology)');
      }

      const res = await registerSubjectAction({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        qualification: qualification.trim() || 'International GCSE',
        version: version.trim() || '2017',
        tiers: hasTiers ? tiers : null,
        status,
        sourceUrl: sourceUrl.trim() || null,
        sourceNotes: sourceNotes.trim() || null,
        components: components.map((c) => ({
          componentCode: c.componentCode.trim().toUpperCase(),
          componentName: c.componentName.trim(),
          maxRawMarks: Number(c.maxRawMarks),
          duration: c.duration.trim() || null,
          weightingPercent: Number(c.weightingPercent) || null,
        })),
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to register subject');
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
        Register Subject
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
                <div className="h-9 w-9 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Register Subject Specification</h2>
                  <p className="text-xs text-[#6B6B6B]">Add a Pearson Edexcel syllabus with examination papers</p>
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
              <Alert variant="destructive" title="Error registering subject">
                <p>{error}</p>
              </Alert>
            )}

            {success && (
              <Alert variant="success" title="Success!">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  Subject syllabus registered successfully.
                </p>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Subject Code"
                    placeholder="e.g. 4BI1"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Subject Title"
                    placeholder="e.g. Biology"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Qualification"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Specification Year / Version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Select
                    label="Tier Configuration"
                    value={hasTiers ? 'tiered' : 'untiered'}
                    onChange={(e) => setHasTiers(e.target.value === 'tiered')}
                    options={[
                      { value: 'untiered', label: 'Untiered (Single unified tier)' },
                      { value: 'tiered', label: 'Tiered (Foundation & Higher)' },
                    ]}
                  />
                </div>

                <div>
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    options={[
                      { value: 'verified', label: 'Verified & Active' },
                      { value: 'unverified', label: 'Unverified' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Official Specification URL"
                  type="url"
                  placeholder="https://qualifications.pearson.com/.../specification.pdf"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              {/* Components definition */}
              <div className="space-y-3 border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Examination Papers / Components
                    </h3>
                    <p className="text-[11px] text-[#6B6B6B]">
                      Define the paper structure so students can calculate component marks.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Paper
                  </Button>
                </div>

                <div className="space-y-3">
                  {components.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex flex-col sm:flex-row items-center gap-3"
                    >
                      <div className="w-full sm:w-24">
                        <Input
                          placeholder="Code (e.g. 1)"
                          value={comp.componentCode}
                          onChange={(e) => handleComponentChange(idx, 'componentCode', e.target.value)}
                          className="h-8 text-xs font-mono font-bold"
                          required
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <Input
                          placeholder="Paper Name (e.g. Paper 1: Biology)"
                          value={comp.componentName}
                          onChange={(e) => handleComponentChange(idx, 'componentName', e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="w-full sm:w-24">
                        <Input
                          type="number"
                          placeholder="Max Mark"
                          value={comp.maxRawMarks}
                          onChange={(e) => handleComponentChange(idx, 'maxRawMarks', Number(e.target.value))}
                          className="h-8 text-xs font-mono"
                          required
                        />
                      </div>

                      <div className="w-full sm:w-20">
                        <Input
                          type="number"
                          placeholder="Weight %"
                          value={comp.weightingPercent}
                          onChange={(e) => handleComponentChange(idx, 'weightingPercent', Number(e.target.value))}
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      {components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(idx)}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded transition-colors cursor-pointer"
                          title="Remove paper"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
                  Register Specification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

