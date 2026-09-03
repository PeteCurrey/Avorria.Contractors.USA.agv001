'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { JhaDocumentPayload, GeneratedDocument } from '@/types/database';

export default function JhaGeneratorPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'input' | 'review' | 'finalized'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Input states
  const [projectName, setProjectName] = useState('Austin Medical Tower Phase II');
  const [jobLocation, setJobLocation] = useState('1100 Congress Ave, Austin, TX');
  const [tradeName, setTradeName] = useState('Electrical Contracting');
  const [workActivity, setWorkActivity] = useState('480V Main Distribution Switchgear De-energization and Tie-in');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [supervisorName, setSupervisorName] = useState('Marcus Vance (Safety Lead)');
  const [workerCount, setWorkerCount] = useState(3);
  const [equipmentInput, setEquipmentInput] = useState('Calibrated Multimeter, Insulated Hand Tools, LOTO Padlocks, Portable Task Lighting');
  const [materialsInput, setMaterialsInput] = useState('Copper busbar extensions, torque seal, heat shrink, terminal lugs');

  // Generated document state
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [payload, setPayload] = useState<JhaDocumentPayload | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>('');

  // Human review gate state
  const [humanReviewAck, setHumanReviewAck] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/contractor/jha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          jobLocation,
          tradeName,
          workActivity,
          workDate,
          supervisorName,
          workerCount: Number(workerCount),
          assignedRoles: ['Lead Electrician', 'Safety Observer', 'Apprentice Technician'],
          competentPerson: supervisorName,
          equipment: equipmentInput.split(',').map((s) => s.trim()).filter(Boolean),
          materials: materialsInput.split(',').map((s) => s.trim()).filter(Boolean),
          useAiIfAvailable: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setGeneratedDoc(json.document);
        setPayload(json.document.document_payload as unknown as JhaDocumentPayload);
        setDisclaimer(json.disclaimer);
        setReviewerName(supervisorName);
        setStage('review');
      }
    } catch (err) {
      console.error('Failed to generate JHA', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async () => {
    if (!humanReviewAck) {
      setReviewError('You must review and check the contractor responsibility acknowledgment before finalising.');
      return;
    }
    if (!generatedDoc) return;

    setIsFinalizing(true);
    setReviewError(null);

    try {
      const res = await fetch('/api/contractor/jha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: generatedDoc.id,
          reviewerName,
          acknowledged: true,
        }),
      });

      if (res.ok) {
        setStage('finalized');
      } else {
        const errJson = await res.json();
        setReviewError(errJson.error || 'Failed to finalize document.');
      }
    } catch {
      setReviewError('Network error finalising document.');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-6">
      {/* Header */}
      <div className="border-b border-surface-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">OSHA 1926/1910 Aligned Workflow</Badge>
            {generatedDoc && (
              <Badge variant={generatedDoc.generation_method === 'ai' ? 'verified' : 'neutral'} size="sm">
                {generatedDoc.generation_method === 'ai' ? 'AI-Generated Draft' : 'Template-Assisted Draft'}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Job Hazard Analysis (JHA) Generator & Editor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define task steps, sequence hazard controls, review with field leads, and sign off before site execution.
          </p>
        </div>

        <Link href="/app/documents">
          <Button size="sm" variant="outline">
            ← Document Vault
          </Button>
        </Link>
      </div>

      {/* STAGE 1: STRUCTURED INPUT FORM */}
      {stage === 'input' && (
        <form onSubmit={handleGenerate} className="space-y-6">
          <Card variant="default" className="space-y-4">
            <CardTitle className="text-base">01 / Project & Work Activity</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Project / Job Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <Input
                label="Specific Job Location"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trade</label>
                <select
                  className="w-full rounded-md bg-surface-subtle border border-surface-border text-white px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                >
                  {STANDARD_TRADES.map((t) => (
                    <option key={t.slug} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Execution Date"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
              />
            </div>

            <Textarea
              label="Work Activity Description"
              rows={2}
              value={workActivity}
              onChange={(e) => setWorkActivity(e.target.value)}
              placeholder="Describe the high-risk task being performed..."
              required
            />
          </Card>

          <Card variant="default" className="space-y-4">
            <CardTitle className="text-base">02 / Workforce, Tools & Materials</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Competent Person / Field Safety Supervisor"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                required
              />
              <Input
                label="Crew Size (Workers on Task)"
                type="number"
                min={1}
                value={workerCount}
                onChange={(e) => setWorkerCount(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Equipment, Machinery & Power Tools"
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              helperText="Separate items with commas"
            />

            <Input
              label="Hazardous Materials & Key Substances"
              value={materialsInput}
              onChange={(e) => setMaterialsInput(e.target.value)}
              helperText="Separate items with commas (e.g. solvents, energized lines, concrete dust)"
            />
          </Card>

          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-2 text-xs text-slate-400">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Responsible Document Engine Notice
            </div>
            <p>
              Avorria applies the OSHA Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE) to generate a structured draft. The contractor must review and adapt all controls before final sign-off.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isGenerating}>
              Generate JHA Draft →
            </Button>
          </div>
        </form>
      )}

      {/* STAGE 2: STRUCTURED REVIEW & HUMAN REVIEW GATE */}
      {stage === 'review' && payload && (
        <div className="space-y-6">
          {/* Provenance Banner */}
          <div className="p-4 rounded-xl bg-surface-card border border-brand-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span>
                  {generatedDoc?.generation_method === 'ai' ? 'AI-Generated Draft' : 'Template-Assisted Draft'}
                </span>
                <span className="text-slate-500 font-mono">({generatedDoc?.generation_model})</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {disclaimer}
              </p>
            </div>
            <Badge variant="primary" size="sm">Status: In Review</Badge>
          </div>

          {/* JHA Summary Overview */}
          <Card variant="default" className="space-y-4">
            <div className="flex justify-between items-start border-b border-surface-border pb-3">
              <div>
                <CardTitle className="text-lg">{payload.jobInfo.workActivity}</CardTitle>
                <div className="text-xs text-slate-400 mt-0.5">
                  {payload.jobInfo.projectName} • {payload.jobInfo.jobLocation}
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                Date: {payload.jobInfo.workDate}
              </div>
            </div>

            {/* Required PPE Matrix */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mandatory PPE Requirements
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { label: 'Hard Hat (ANSI Z89.1)', active: payload.ppe.head },
                  { label: 'Safety Glasses / Shield', active: payload.ppe.eyeFace },
                  { label: 'Hearing Protection', active: payload.ppe.hearing },
                  { label: 'Cut-Resistant Gloves', active: payload.ppe.hand },
                  { label: 'Safety-Toe Boots', active: payload.ppe.foot },
                  { label: 'Fall Harness & Lanyard', active: payload.ppe.fallProtection },
                  { label: 'Arc-Rated Face & PPE', active: payload.ppe.arcFlash },
                  { label: 'Dust / Vapor Respirator', active: payload.ppe.respiratory },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border flex items-center justify-between ${
                      item.active
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'bg-surface-subtle border-surface-border text-slate-500'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span>{item.active ? '✓' : '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hazard Sequence Steps */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Sequenced Task Hazards & Hierarchy of Controls
              </div>

              {payload.hazardSequence.map((step) => (
                <div key={step.id} className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Step {step.sequence}: {step.taskStep}
                    </span>
                    {step.regulatoryReference && (
                      <span className="font-mono text-[10px] text-brand-400">
                        {step.regulatoryReference}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-rose-400">Potential Hazards:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {step.potentialHazards.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-400">Required Controls:</span>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {step.controls.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="font-mono uppercase text-[10px] px-1 rounded bg-surface-card border border-surface-border text-brand-300">
                              {c.hierarchyLevel}
                            </span>
                            <span>{c.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Procedures */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-xs space-y-1 text-slate-300">
              <span className="font-bold text-white block">Emergency Response Plan:</span>
              <div>First Aid Location: {payload.emergencyAction.firstAidKitLocation}</div>
              <div>Medical Facility: {payload.emergencyAction.nearestMedicalFacility}</div>
              <div>Site Muster Point: {payload.emergencyAction.musterPoint}</div>
            </div>
          </Card>

          {/* MANDATORY HUMAN REVIEW GATE */}
          <Card variant="elevated" className="border-brand-500 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <CardTitle className="text-base text-white">
                Mandatory Contractor Review & Sign-Off Gate
              </CardTitle>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Before finalising this document, the contractor must verify that all sequenced task steps, potential hazards, and OSHA control measures have been reviewed and tailored for this specific project and workforce.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reviewing Safety Lead / Supervisor Name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={humanReviewAck}
                    onChange={(e) => setHumanReviewAck(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-500"
                  />
                  <span>I confirm I have reviewed and adapted this JHA for actual site conditions.</span>
                </label>
              </div>
            </div>

            {reviewError && (
              <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {reviewError}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-surface-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setStage('input')}>
                ← Edit Inputs
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinalize}
                isLoading={isFinalizing}
              >
                Sign & Finalise JHA Document ✓
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* STAGE 3: FINALIZED CONFIRMATION */}
      {stage === 'finalized' && (
        <Card variant="default" className="py-12 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-2xl mx-auto">
            ✓
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl text-white">Job Hazard Analysis Finalized</CardTitle>
            <CardDescription className="text-xs max-w-sm mx-auto">
              Document signed by <strong>{reviewerName}</strong> and saved to your Document Vault. Your safety readiness metric has been updated.
            </CardDescription>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button href="/app/documents" size="md" variant="primary">
              View in Document Vault
            </Button>
            <Button href="/app/dashboard" size="md" variant="secondary">
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
