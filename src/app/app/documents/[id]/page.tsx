'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { DocumentPreview } from '@/components/documents/DocumentPreview';
import { UniversalDocumentPayload } from '@/lib/documents/types';
import { getDocumentDefinition } from '@/lib/documents/registry';
import { DocumentTypeSlug } from '@/lib/documents/types';

interface DocumentRecord {
  id: string;
  title: string;
  documentType: string;
  documentStatus: string;
  generationMethod: 'ai' | 'template' | 'manual';
  generationModel?: string;
  versionNumber: number;
  payload: UniversalDocumentPayload;
  disclaimer?: string;
  createdAt: string;
  updatedAt?: string;
}

interface DocumentViewPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentViewPage({ params }: DocumentViewPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [versionSuccess, setVersionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoc() {
      try {
        const res = await fetch(`/api/contractor/documents/engine/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Document not found');
        }
        const data = await res.json();
        const d = data.document;
        setDoc({
          id: d.id,
          title: d.title,
          documentType: d.document_type,
          documentStatus: d.document_status,
          generationMethod: d.generation_method,
          generationModel: d.generation_model,
          versionNumber: d.version_number,
          payload: d.document_payload as UniversalDocumentPayload,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    }
    loadDoc();
  }, [id]);

  const handleSaveDraft = async (payload: UniversalDocumentPayload, title: string) => {
    const res = await fetch(`/api/contractor/documents/engine/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, documentPayload: payload }),
    });
    if (res.ok) {
      const data = await res.json();
      const d = data.document;
      setDoc((prev) => prev ? {
        ...prev,
        title: d.title,
        payload: d.document_payload as UniversalDocumentPayload,
        updatedAt: d.updated_at,
      } : null);
    }
  };

  const handleFinalize = async (reviewerName: string, acknowledged: boolean) => {
    const res = await fetch(`/api/contractor/documents/engine/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerName, acknowledged }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Finalization failed');
    }
    const data = await res.json();
    const d = data.document;
    setDoc((prev) => prev ? {
      ...prev,
      documentStatus: d.document_status,
    } : null);
  };

  const handleCreateVersion = async () => {
    setIsCreatingVersion(true);
    setVersionSuccess(null);
    try {
      const res = await fetch(`/api/contractor/documents/engine/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to create new version');
      const data = await res.json();
      setVersionSuccess('New version created. Navigating...');
      setTimeout(() => router.push(`/app/documents/${data.document.id}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
    } finally {
      setIsCreatingVersion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-app py-8 flex items-center justify-center min-h-[40vh]">
        <div className="text-slate-400 text-xs animate-pulse">Loading document...</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="container-app py-8 text-center space-y-4">
        <div className="text-rose-400 text-sm">{error || 'Document not found.'}</div>
        <Link href="/app/documents"><Button size="sm" variant="secondary">← Document Vault</Button></Link>
      </div>
    );
  }

  const definition = getDocumentDefinition(doc.documentType as DocumentTypeSlug);
  const isFinal = doc.documentStatus === 'final' || doc.documentStatus === 'superseded';

  return (
    <div className="container-app py-8 space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/app/documents" className="hover:text-white transition-colors">Document Vault</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 truncate max-w-[200px]">{doc.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => window.print()}>🖨️ Print</Button>
          <Link href="/app/documents"><Button size="sm" variant="outline">← Vault</Button></Link>
        </div>
      </div>

      {versionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
          {versionSuccess}
        </div>
      )}

      {/* Meta strip */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {definition && <Badge variant="trade" size="sm">{definition.code}</Badge>}
            <Badge variant={isFinal ? 'current' : 'primary'} size="sm">
              {doc.documentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant={doc.generationMethod === 'ai' ? 'verified' : 'neutral'} size="sm">
              {doc.generationMethod === 'ai' ? '⚡ AI-Generated' : '📋 Template'}
            </Badge>
            <span className="font-mono text-slate-400 text-[11px]">v{doc.versionNumber}.0</span>
          </div>
          <h1 className="text-lg font-black text-white">{doc.title}</h1>
          <div className="text-[11px] text-slate-500 font-mono">
            Created {new Date(doc.createdAt).toLocaleDateString('en-US')}
            {doc.updatedAt && ` · Updated ${new Date(doc.updatedAt).toLocaleDateString('en-US')}`}
          </div>
        </div>

        {isFinal && (
          <Button size="sm" variant="secondary" onClick={handleCreateVersion} isLoading={isCreatingVersion}>
            + New Version
          </Button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-surface-border">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-brand-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab === 'edit' ? '✏️ Editor' : '🖨️ Document Preview'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'edit' ? (
        <DocumentEditor
          document={doc}
          requiresHumanReview={definition?.requiresHumanReview ?? false}
          onSaveDraft={handleSaveDraft}
          onFinalize={handleFinalize}
          onCreateVersion={isFinal ? handleCreateVersion : undefined}
        />
      ) : (
        <div className="rounded-xl overflow-hidden shadow-2xl print:shadow-none">
          <DocumentPreview
            payload={doc.payload}
            generationMethod={doc.generationMethod}
            referenceNumber={doc.payload.referenceNumber || doc.id}
            documentStatus={doc.documentStatus}
            versionNumber={doc.versionNumber}
            generationModel={doc.generationModel}
          />
        </div>
      )}
    </div>
  );
}
