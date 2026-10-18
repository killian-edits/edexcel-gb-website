'use client';

import React, { useState } from 'react';
import type { Subject, SubjectComponent, GradeBoundary, Tier, Grade } from '@/types';
import { calculateGrade, calculateTarget } from '@/lib/calculator';
import { formatSeries } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { GradeBadge } from '@/components/ui/grade-badge';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, History, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SubjectCalculatorClientProps {
  subject: Subject;
  initialComponents: SubjectComponent[];
  boundaries: GradeBoundary[];
  availableSeries: string[];
}

export function SubjectCalculatorClient({
  subject,
  initialComponents,
  boundaries,
  availableSeries,
}: SubjectCalculatorClientProps) {
  // Modes: 'predict' | 'target' | 'trends'
  const [activeTab, setActiveTab] = useState<'predict' | 'target' | 'trends'>('predict');

  const normalizeTier = (t?: string | null) => (t ? t.toLowerCase().trim() : null);

  // Compute initial tier: pick the tier that actually has boundaries in the dataset
  const getInitialTier = (): Tier | '' => {
    if (!subject.tiers || subject.tiers.length === 0) return '';
    const lowerTiers = subject.tiers.map((t) => t.toLowerCase() as Tier);
    const tierWithBoundaries = lowerTiers.find((t) =>
      boundaries.some((b) => normalizeTier(b.tier) === t)
    );
    return tierWithBoundaries || lowerTiers[0] || '';
  };

  // Configuration State
  const [selectedTier, setSelectedTier] = useState<Tier | ''>(getInitialTier());

  // Filter boundaries by tier
  const tierBoundaries = boundaries
    .filter((b) => {
      if (!selectedTier) return true;
      return normalizeTier(b.tier) === normalizeTier(selectedTier);
    })
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  const displayBoundaries = tierBoundaries.length > 0 ? tierBoundaries : boundaries;

  // Selected boundary ID for the exact session + year
  const [selectedBoundaryId, setSelectedBoundaryId] = useState<string>(
    displayBoundaries[0]?.id || ''
  );

  // Active boundary for the chosen session & tier
  const activeBoundary =
    boundaries.find((b) => b.id === selectedBoundaryId) ||
    displayBoundaries[0] ||
    boundaries[0];

  // Filtered components based on tier
  const activeComponents = initialComponents.filter((comp) => {
    if (!selectedTier) return true;
    const norm = normalizeTier(selectedTier);
    if (norm === 'higher') {
      return comp.componentCode.endsWith('H') || !comp.componentCode.match(/[HF]$/);
    }
    if (norm === 'foundation') {
      return comp.componentCode.endsWith('F') || !comp.componentCode.match(/[HF]$/);
    }
    return true;
  });

  // Marks State: componentCode -> rawMark input string
  const [marks, setMarks] = useState<Record<string, string>>({});

  // Target Planner State
  const [targetGrade, setTargetGrade] = useState<Grade>('7');

  const handleMarkChange = (code: string, value: string) => {
    setMarks((prev) => ({ ...prev, [code]: value }));
  };

  const handleTierChange = (newTier: Tier | '') => {
    setSelectedTier(newTier);
    const filtered = boundaries.filter((b) => {
      if (!newTier) return true;
      return normalizeTier(b.tier) === normalizeTier(newTier);
    });
    if (filtered.length > 0 && !filtered.some((b) => b.id === selectedBoundaryId)) {
      setSelectedBoundaryId(filtered[0].id);
    }
  };

  // Perform Score Prediction
  const runPrediction = () => {
    if (!activeBoundary) return null;

    const parsedMarks = activeComponents.map((c) => ({
      componentCode: c.componentCode,
      rawMark: marks[c.componentCode] !== undefined && marks[c.componentCode] !== ''
        ? Number(marks[c.componentCode])
        : NaN,
    }));

    return calculateGrade(
      {
        subjectCode: subject.code,
        series: activeBoundary.series,
        tier: (activeBoundary.tier as Tier | null) ?? null,
        variant: activeBoundary.variant,
        componentMarks: parsedMarks,
      },
      {
        components: activeComponents,
        boundary: activeBoundary,
      }
    );
  };

  // Perform Target Planning
  const runTargetPlan = () => {
    if (!activeBoundary) return null;

    const completedMarks = activeComponents
      .filter((c) => marks[c.componentCode] !== undefined && marks[c.componentCode] !== '')
      .map((c) => ({
        componentCode: c.componentCode,
        rawMark: Number(marks[c.componentCode]),
      }));

    return calculateTarget(
      {
        subjectCode: subject.code,
        series: activeBoundary.series,
        tier: (activeBoundary.tier as Tier | null) ?? null,
        variant: activeBoundary.variant,
        targetGrade,
        completedMarks,
      },
      {
        components: activeComponents,
        boundary: activeBoundary,
      }
    );
  };

  const predictionResult = runPrediction();
  const targetResult = runTargetPlan();

  // Prepare chart data from boundaries sorted chronologically
  const chartData = [...displayBoundaries]
    .sort((a, b) => a.year - b.year || a.series.localeCompare(b.series))
    .map((b) => ({
      name: `${formatSeries(b.series, b.year)}${b.variant ? ` (${b.variant})` : ''}`,
      '9': b.thresholds['9'],
      '8': b.thresholds['8'],
      '7': b.thresholds['7'],
      '6': b.thresholds['6'],
      '5': b.thresholds['5'],
      '4': b.thresholds['4'],
      '3': b.thresholds['3'],
      maxMark: b.maxMark,
    }));

  return (
    <div className="space-y-8">
      {/* Configuration bar */}
      <Card className="bg-[#F5F5F0] border-[#E5E5E5]">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Exam Series & Year"
                value={activeBoundary ? activeBoundary.id : selectedBoundaryId}
                onChange={(e) => setSelectedBoundaryId(e.target.value)}
                options={displayBoundaries.map((b) => ({
                  value: b.id,
                  label: `${formatSeries(b.series, b.year)}${b.variant ? ` (Variant ${b.variant})` : ''}`,
                }))}
              />
            </div>

            {subject.tiers && (
              <div>
                <Select
                  label="Tier"
                  value={selectedTier}
                  onChange={(e) => handleTierChange(e.target.value as Tier)}
                  options={subject.tiers.map((t) => {
                    const norm = t.toLowerCase() as Tier;
                    return {
                      value: norm,
                      label: norm.charAt(0).toUpperCase() + norm.slice(1) + ' Tier',
                    };
                  })}
                />
              </div>
            )}

            <div className="flex flex-col justify-end">
              <div className="text-xs text-[#6B6B6B] space-y-1">
                <p className="font-semibold text-[#1A1A1A]">
                  Session: {activeBoundary ? formatSeries(activeBoundary.series, activeBoundary.year) : 'N/A'}{' '}
                  {activeBoundary?.tier ? `(${activeBoundary.tier.charAt(0).toUpperCase() + activeBoundary.tier.slice(1)} Tier)` : ''}
                </p>
                <p className="text-[#6B6B6B]">Scale: {activeBoundary?.maxMark ?? 'N/A'} marks</p>
                <p>Status: <span className="text-[#16A34A] font-medium">Verified Official Archive</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode navigation tabs */}
      <div className="flex border-b border-[#E5E5E5] space-x-4">
        <button
          onClick={() => setActiveTab('predict')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'predict'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Score Prediction</span>
        </button>

        <button
          onClick={() => setActiveTab('target')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'target'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Target Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'trends'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Historical Trends</span>
        </button>
      </div>

      {/* Tab 1: Score Prediction */}
      {activeTab === 'predict' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Mock Component Marks</CardTitle>
                <CardDescription>
                  Enter raw marks for each examination paper. Values must not exceed paper maximums.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeComponents.map((comp) => (
                  <div key={comp.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-[#E5E5E5] rounded">
                          Paper {comp.componentCode}
                        </span>
                        <h4 className="text-sm font-semibold text-[#1A1A1A]">{comp.componentName}</h4>
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Max marks: {comp.maxRawMarks} {comp.weightingPercent ? `• Weighting: ${comp.weightingPercent}%` : ''}
                      </p>
                    </div>

                    <div className="w-full sm:w-36">
                      <Input
                        type="number"
                        min={0}
                        max={comp.maxRawMarks}
                        placeholder={`0 - ${comp.maxRawMarks}`}
                        value={marks[comp.componentCode] ?? ''}
                        onChange={(e) => handleMarkChange(comp.componentCode, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#0284C7]/20 shadow-sm">
              <CardHeader className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
                <CardTitle className="text-base text-[#0369A1]">Estimated Outcome</CardTitle>
                <CardDescription className="text-xs text-[#0284C7]">
                  Applied to {activeBoundary ? formatSeries(activeBoundary.series, activeBoundary.year) : 'selected session'} standards
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {predictionResult?.status === 'success' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6B6B6B]">Predicted Grade</span>
                      <GradeBadge grade={predictionResult.grade} size="lg" />
                    </div>

                    <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6B6B6B]">Total Raw Score</span>
                        <span className="font-mono font-semibold text-[#1A1A1A]">
                          {predictionResult.totalMark} / {predictionResult.maxTotalMark}
                        </span>
                      </div>
                      {predictionResult.scaledTotal !== null && (
                        <div className="flex justify-between text-xs">
                          <span className="text-[#6B6B6B]">Scaled / Weighted Total</span>
                          <span className="font-mono font-semibold text-[#1A1A1A]">
                            {predictionResult.scaledTotal} / {predictionResult.maxScaledTotal}
                          </span>
                        </div>
                      )}
                      {predictionResult.marksToNextGrade !== null && predictionResult.nextGrade && (
                        <div className="flex justify-between text-xs text-[#0284C7] bg-[#F0F9FF] p-2 rounded">
                          <span>Marks to next grade ({predictionResult.nextGrade})</span>
                          <span className="font-mono font-bold">+{predictionResult.marksToNextGrade}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#E5E5E5] pt-4 text-[11px] text-[#6B6B6B] space-y-1">
                      <p className="font-semibold text-[#1A1A1A]">Calculation Logic:</p>
                      {predictionResult.appliedRules.map((rule, idx) => (
                        <p key={idx}>• {rule}</p>
                      ))}
                    </div>
                  </div>
                ) : predictionResult?.status === 'invalid_input' ? (
                  <Alert variant="destructive" title="Invalid Marks">
                    <ul className="list-disc list-inside space-y-1">
                      {predictionResult.errors.map((err, idx) => (
                        <li key={idx}>{err.message}</li>
                      ))}
                    </ul>
                  </Alert>
                ) : (
                  <div className="text-center py-6 text-sm text-[#6B6B6B]">
                    Enter your paper marks to calculate your projected grade.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Target Planner */}
      {activeTab === 'target' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure Target & Completed Marks</CardTitle>
                <CardDescription>
                  Enter any papers you have already taken. Leave upcoming papers blank.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="w-full sm:w-48">
                  <Select
                    label="Desired Target Grade"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value as Grade)}
                    options={['9', '8', '7', '6', '5', '4', '3', '2', '1'].map((g) => ({
                      value: g,
                      label: `Grade ${g}`,
                    }))}
                  />
                </div>

                <div className="space-y-4">
                  {activeComponents.map((comp) => (
                    <div key={comp.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-[#E5E5E5] rounded">
                            Paper {comp.componentCode}
                          </span>
                          <h4 className="text-sm font-semibold text-[#1A1A1A]">{comp.componentName}</h4>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-1">
                          Max: {comp.maxRawMarks} marks (leave blank if unattempted)
                        </p>
                      </div>

                      <div className="w-full sm:w-36">
                        <Input
                          type="number"
                          placeholder="Unattempted"
                          value={marks[comp.componentCode] ?? ''}
                          onChange={(e) => handleMarkChange(comp.componentCode, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#0284C7]/20 shadow-sm">
              <CardHeader className="bg-[#F0FDF4] border-b border-[#BBF7D0]">
                <CardTitle className="text-base text-[#15803D]">Target Feasibility</CardTitle>
                <CardDescription className="text-xs text-[#16A34A]">
                  Required remaining marks for Grade {targetGrade} ({activeBoundary ? formatSeries(activeBoundary.series, activeBoundary.year) : ''})
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {targetResult?.status === 'target_achievable' ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-center">
                      <p className="text-xs text-[#166534] font-medium">Marks Required Across Remaining Papers</p>
                      <p className="text-3xl font-extrabold text-[#15803D] mt-1">
                        {targetResult.requiredRemaining}
                      </p>
                      <p className="text-[11px] text-[#166534] mt-1">
                        out of {targetResult.remainingCapacity} remaining marks available
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Completed Marks</span>
                        <span className="font-mono font-semibold">{targetResult.completedTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B6B]">Remaining Capacity</span>
                        <span className="font-mono font-semibold">{targetResult.remainingCapacity}</span>
                      </div>
                    </div>
                  </div>
                ) : targetResult?.status === 'target_impossible' ? (
                  <Alert variant="destructive" title="Target Mathematically Impossible">
                    <p>{targetResult.reason}</p>
                  </Alert>
                ) : targetResult?.status === 'target_already_achieved' ? (
                  <Alert variant="success" title="Target Already Achieved!">
                    <p>Your completed marks have already reached Grade {targetResult.targetGrade}.</p>
                  </Alert>
                ) : (
                  <p className="text-sm text-[#6B6B6B] text-center py-4">
                    Fill in target and current scores to view requirements.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Historical Trends */}
      {activeTab === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Boundary Trajectory</CardTitle>
            <CardDescription>
              Published minimum mark thresholds required for each grade across verified exam series.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="name" stroke="#6B6B6B" fontSize={12} />
                  <YAxis stroke="#6B6B6B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="9" stroke="#16A34A" strokeWidth={2} />
                  <Line type="monotone" dataKey="8" stroke="#059669" strokeWidth={2} />
                  <Line type="monotone" dataKey="7" stroke="#0284C7" strokeWidth={2} />
                  <Line type="monotone" dataKey="6" stroke="#84CC16" strokeWidth={2} />
                  <Line type="monotone" dataKey="5" stroke="#EAB308" strokeWidth={2} />
                  <Line type="monotone" dataKey="4" stroke="#EA580C" strokeWidth={2} />
                  <Line type="monotone" dataKey="3" stroke="#DC2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto border-t border-[#E5E5E5] pt-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#6B6B6B]">
                    <th className="py-2 font-semibold">Series / Session</th>
                    <th className="py-2 font-semibold">Year</th>
                    <th className="py-2 font-semibold">Tier</th>
                    <th className="py-2 font-semibold">Max Mark</th>
                    <th className="py-2 font-semibold">9</th>
                    <th className="py-2 font-semibold">8</th>
                    <th className="py-2 font-semibold">7</th>
                    <th className="py-2 font-semibold">6</th>
                    <th className="py-2 font-semibold">5</th>
                    <th className="py-2 font-semibold">4</th>
                    <th className="py-2 font-semibold">3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F0]">
                  {displayBoundaries.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAFAFA]">
                      <td className="py-2.5 font-medium text-[#1A1A1A]">
                        {formatSeries(b.series, b.year)}
                        {b.variant ? ` (Variant ${b.variant})` : ''}
                      </td>
                      <td className="py-2.5 font-mono text-[#6B6B6B]">{b.year}</td>
                      <td className="py-2.5 text-[#6B6B6B] capitalize">{b.tier || 'Untiered'}</td>
                      <td className="py-2.5 text-[#6B6B6B]">{b.maxMark}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#16A34A]">{b.thresholds['9'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#059669]">{b.thresholds['8'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#0284C7]">{b.thresholds['7'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#84CC16]">{b.thresholds['6'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#EAB308]">{b.thresholds['5'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#EA580C]">{b.thresholds['4'] ?? '-'}</td>
                      <td className="py-2.5 font-mono font-semibold text-[#DC2626]">{b.thresholds['3'] ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

