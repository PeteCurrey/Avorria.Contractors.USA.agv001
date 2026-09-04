'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentTypeSlug } from '@/lib/documents/types';
import { DocumentTypeDefinition } from '@/lib/documents/registry';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { DocumentEditor } from './DocumentEditor';
import { DocumentPreview } from './DocumentPreview';
import { UniversalDocumentPayload } from '@/lib/documents/types';

interface ProjectInputs {
  name: string;
  clientName: string;
  siteLocation: string;
  projectReference: string;
  jobDescription: string;
  startDate: string;
}

interface CustomInputs {
  [key: string]: string | number | boolean;
}

interface UniversalCreatePageProps {
  definition: DocumentTypeDefinition;
  customFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date';
    placeholder?: string;
    required?: boolean;
    helperText?: string;
  }>;
}

export function UniversalCreatePage({ definition, customFields = [] }: UniversalCreatePageProps) {
  const router = useRouter();
  const [stage, setStage] = useState<'input' | 'review' | 'finalized'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<ProjectInputs>({
    name: '',
    clientName: '',
    siteLocation: '',
    projectReference: '',
    jobDescription: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [customInputs, setCustomInputs] = useState<CustomInputs>({});
  const [generatedDoc, setGeneratedDoc] = useState<{
    id: string;
    title: string;
    documentType: string;
    documentStatus: string;
    generationMethod: 'ai' | 'template' | 'manual';
    generationModel?: string;
    versionNumber: number;
    payload: UniversalDocumentPayload;
    disclaimer?: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/contractor/documents/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: definition.type,
          project: {
            name: project.name || `${definition.name} Document`,
            clientName: project.clientName || 'Client Representative',
            siteLocation: project.siteLocation || 'Site Location',
            projectReference: project.projectReference,
            jobDescription: project.jobDescription,
            startDate: project.startDate,
          },
          customInputs,
          useAiIfAvailable: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Generation failed');
      }

      const data = await res.json();
      setGeneratedDoc({
        id: data.document.id,
        title: data.document.title,
        documentType: data.document.document_type,
        documentStatus: data.document.document_status,
        generationMethod: data.document.generation_method,
        generationModel: data.document.generation_model,
        versionNumber: data.document.version_number,
        payload: data.document.document_payload as UniversalDocumentPayload,
        disclaimer: data.disclaimer,
      });
      setStage('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async (payload: UniversalDocumentPayload, title: string) => {
    if (!generatedDoc) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/contractor/documents/engine/${generatedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, documentPayload: payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedDoc((prev) => prev ? {
          ...prev,
          title: data.document.title,
          payload: data.document.document_payload as UniversalDocumentPayload,
        } : null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async (reviewerName: string, acknowledged: boolean) => {
    if (!generatedDoc) return;
    setIsFinalizing(true);
    try {
      const res = await fetch(`/api/contractor/documents/engine/${generatedDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerName, acknowledged }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Finalization failed');
      }

      setStage('finalized');
    } catch (err) {
      throw err;
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Header */}
      <div className="border-b border-surface-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="trade" size="sm">{definition.code}</Badge>
            {definition.requiresHumanReview && (
              <Badge variant="neutral" size="sm">Review Gate Required</Badge>
            )}
            {definition.readinessRelevance && (
              <Badge variant="current" size="sm">+ Readiness Impact</Badge>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{definition.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{definition.description}</p>
        </div>
        <Link href="/app/documents">
          <Button size="sm" variant="outline">← Documents</Button>
        </Link>
      </div>

      {/* Stage indicator */}
      <div className="flex items-center gap-1 text-xs font-mono">
        {(['input', 'review', 'finalized'] as const).map((s, i) => (
          <React.Fragment key={s}>
            <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${stage === s ? 'bg-brand-600 text-white' : stage === 'finalized' && i < 2 ? 'bg-emerald-950 text-emerald-400' : 'bg-surface-subtle text-slate-500 border border-surface-border'}`}>
              {i + 1}. {s === 'input' ? 'Project & Inputs' : s === 'review' ? 'Review & Edit' : 'Finalised'}
            </span>
            {i < 2 && <span className="text-slate-600 text-lg">→</span>}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STAGE 1: INPUT */}
      {stage === 'input' && (
        <form onSubmit={handleGenerate} className="space-y-6">
          <Card variant="default" className="space-y-4">
            <CardTitle className="text-base">01 / Project & Client Information</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Project / Job Name" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} placeholder={`${definition.name} Project`} />
              <Input label="Client Name" value={project.clientName} onChange={(e) => setProject({ ...project, clientName: e.target.value })} placeholder="Client or General Contractor" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Site Location" value={project.siteLocation} onChange={(e) => setProject({ ...project, siteLocation: e.target.value })} placeholder="Full site address" />
              <Input label="Project Reference" value={project.projectReference} onChange={(e) => setProject({ ...project, projectReference: e.target.value })} placeholder="Job # or Contract Reference" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea label="Job / Scope Description" rows={2} value={project.jobDescription} onChange={(e) => setProject({ ...project, jobDescription: e.target.value })} placeholder="Brief description of the work being performed..." />
              <Input label="Document Date" type="date" value={project.startDate} onChange={(e) => setProject({ ...project, startDate: e.target.value })} />
            </div>
          </Card>

          {customFields.length > 0 && (
            <Card variant="default" className="space-y-4">
              <CardTitle className="text-base">02 / {definition.name} Details</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customFields.map((field) => (
                  field.type === 'textarea' ? (
                    <div key={field.key} className="sm:col-span-2">
                      <Textarea
                        label={field.label}
                        rows={3}
                        value={String(customInputs[field.key] || '')}
                        onChange={(e) => setCustomInputs({ ...customInputs, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ) : (
                    <Input
                      key={field.key}
                      label={field.label}
                      type={field.type}
                      value={String(customInputs[field.key] || '')}
                      onChange={(e) => setCustomInputs({ ...customInputs, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      helperText={field.helperText}
                    />
                  )
                ))}
              </div>
            </Card>
          )}

          <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-slate-400 space-y-1 leading-relaxed">
            <strong className="text-slate-300 uppercase text-[10px] font-mono tracking-wider block">Document Generation Notice</strong>
            <p>
              Avorria will generate a structured professional draft using your contractor profile and the project details above.
              {definition.supportsAi ? ' If an AI key is configured, an AI-assisted draft will be created and clearly labeled.' : ' A template-based draft will be generated.'}
              {definition.requiresHumanReview && ' This document requires your review and sign-off before it can be finalised.'}
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isGenerating}>
              Generate {definition.name} Draft →
            </Button>
          </div>
        </form>
      )}

      {/* STAGE 2: REVIEW & EDIT */}
      {stage === 'review' && generatedDoc && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded font-semibold ${generatedDoc.generationMethod === 'ai' ? 'bg-brand-950 text-brand-400 border border-brand-800' : 'bg-surface-subtle text-slate-300 border border-surface-border'}`}>
                {generatedDoc.generationMethod === 'ai' ? '⚡ AI-Generated Draft' : '📋 Template-Assisted Draft'}
              </span>
              <span className="text-slate-500 font-mono text-[10px]">via {generatedDoc.generationModel}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? '← Back to Editor' : '🖨️ Preview / Print'}
            </Button>
          </div>

          {showPreview ? (
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <DocumentPreview
                payload={generatedDoc.payload}
                generationMethod={generatedDoc.generationMethod}
                referenceNumber={generatedDoc.payload.referenceNumber || generatedDoc.id}
                documentStatus={generatedDoc.documentStatus}
                versionNumber={generatedDoc.versionNumber}
                generationModel={generatedDoc.generationModel}
              />
            </div>
          ) : (
            <DocumentEditor
              document={generatedDoc}
              requiresHumanReview={definition.requiresHumanReview}
              onSaveDraft={handleSaveDraft}
              onFinalize={handleFinalize}
            />
          )}
        </div>
      )}

      {/* STAGE 3: FINALIZED */}
      {stage === 'finalized' && (
        <Card variant="default" className="py-12 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-3xl mx-auto">✓</div>
          <div className="space-y-2">
            <CardTitle className="text-xl text-white">{definition.name} Finalised</CardTitle>
            <CardDescription className="text-xs max-w-sm mx-auto">
              Document saved to your Document Vault. Your contractor readiness profile has been updated where applicable.
            </CardDescription>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button href="/app/documents" size="md" variant="primary">View in Document Vault</Button>
            <Button href="/app/dashboard" size="md" variant="secondary">Go to Dashboard</Button>
            <Button size="md" variant="outline" onClick={() => { setStage('input'); setGeneratedDoc(null); setError(null); }}>
              Create Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
