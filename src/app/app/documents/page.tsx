'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BusinessDocument } from '@/types/database';
import { calculateDaysRemaining } from '@/lib/compliance/engine';

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedParentDoc, setSelectedParentDoc] = useState<BusinessDocument | null>(null);

  // Upload modal form states
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('insurance_coi');
  const [expiresAt, setExpiresAt] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/contractor/documents');
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const payload: Record<string, unknown> = {
        title: docTitle,
        documentType: docType,
        expiresAt: expiresAt || undefined,
        issuingOrg: issuingOrg || undefined,
        notes: notes || undefined,
        parentDocumentId: selectedParentDoc?.id || undefined,
      };

      const res = await fetch('/api/contractor/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setSelectedParentDoc(null);
        setDocTitle('');
        setExpiresAt('');
        setIssuingOrg('');
        setNotes('');
        await fetchDocs();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this document?')) return;
    try {
      const res = await fetch(`/api/contractor/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDocs();
      }
    } catch (err) {
      console.error('Archive failed', err);
    }
  };

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'insurance', label: 'Insurance (COI)' },
    { id: 'license', label: 'Licenses' },
    { id: 'safety', label: 'Safety Plans & JHAs' },
    { id: 'training', label: 'Training Records' },
  ];

  const filteredDocs = documents.filter((d) => {
    if (d.status === 'archived') return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'insurance') return d.document_type.includes('insurance') || d.document_type.includes('coi');
    if (activeCategory === 'license') return d.document_type.includes('license');
    if (activeCategory === 'safety') return d.document_type.includes('safety') || d.document_type.includes('jha');
    if (activeCategory === 'training') return d.document_type.includes('training') || d.document_type.includes('osha');
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Document Vault</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized repository for Certificates of Insurance, state trade licenses, safety programs, and versioned records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/documents/create/jha">
            <Button size="sm" variant="secondary">
              ⚡ JHA Generator
            </Button>
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setSelectedParentDoc(null);
              setShowUploadModal(true);
            }}
          >
            + Upload Document
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-surface-subtle text-slate-400 hover:text-white border border-surface-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document List or Empty State */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading Document Vault...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <Card variant="default" className="py-12 text-center space-y-4 max-w-lg mx-auto">
          <span className="text-4xl">📁</span>
          <CardTitle className="text-base">Your Document Vault is Ready</CardTitle>
          <CardDescription className="text-xs max-w-sm mx-auto">
            Upload your first Certificate of Insurance, trade license, or safety plan to establish your verified contractor record.
          </CardDescription>
          <Button size="md" variant="primary" onClick={() => setShowUploadModal(true)}>
            Upload Your First Document
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const daysRemaining = calculateDaysRemaining(doc.expires_at);
            let status: 'current' | 'expiring' | 'expired' = 'current';
            if (daysRemaining !== undefined) {
              if (daysRemaining < 0) status = 'expired';
              else if (daysRemaining <= 60) status = 'expiring';
            }

            return (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-surface-borderLight transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{doc.title}</span>
                    <Badge variant="neutral" size="sm">
                      v{doc.version_number}.0
                    </Badge>
                  </div>
                  <div className="text-slate-400 flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="capitalize font-mono text-brand-400">
                      {doc.document_type.replace('_', ' ')}
                    </span>
                    {doc.issuing_organisation && <span>• Issuer: {doc.issuing_organisation}</span>}
                    {doc.expires_at && (
                      <span>
                        • Expires: {new Date(doc.expires_at).toLocaleDateString()}
                        {daysRemaining !== undefined && (
                          <span className={daysRemaining <= 30 ? 'text-amber-400 ml-1' : 'text-slate-400 ml-1'}>
                            ({daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {doc.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{doc.notes}</div>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusIndicator
                    status={status}
                    label={status === 'current' ? 'Current' : status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedParentDoc(doc);
                      setDocTitle(`${doc.title} (Renewal)`);
                      setDocType(doc.document_type);
                      setShowUploadModal(true);
                    }}
                  >
                    + New Version
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleArchive(doc.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Archive Document"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD / NEW VERSION MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md w-full space-y-4 text-left border-brand-500/50">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <CardTitle className="text-base">
                {selectedParentDoc ? `Upload New Version for v${selectedParentDoc.version_number}.0` : 'Upload Evidence Document'}
              </CardTitle>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <Input
                label="Document Title"
                placeholder="e.g. Travelers Commercial GL COI 2026-2027"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
              />

              {!selectedParentDoc && (
                <Select
                  label="Document Category"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  options={[
                    { value: 'insurance_coi', label: 'Certificate of Insurance (COI)' },
                    { value: 'workers_comp', label: 'Workers’ Compensation Policy' },
                    { value: 'trade_license', label: 'State / Municipal Trade License' },
                    { value: 'safety_policy', label: 'Written Safety Program / HASP' },
                    { value: 'osha_certificate', label: 'OSHA 10 / 30 Training Card' },
                    { value: 'toolbox_talk_roster', label: 'Toolbox Talk Attendance Roster' },
                    { value: 'other', label: 'Other Operational Document' },
                  ]}
                />
              )}

              <Input
                label="Expiration Date (if applicable)"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                helperText="Avorria will automatically alert you 60, 30, and 14 days before renewal."
              />

              <Input
                label="Issuing Organization / Insurer / Agency"
                placeholder="e.g. Travelers Casualty, TDLR, OSHA"
                value={issuingOrg}
                onChange={(e) => setIssuingOrg(e.target.value)}
              />

              <Input
                label="Optional Reference Notes"
                placeholder="Policy #GL-994821 or state registration ID"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-[11px] text-slate-400">
                <span className="text-brand-400 font-bold">🔒 Private Document Vault:</span> Uploaded records are encrypted and isolated to your organization. They are never indexed or exposed publicly without your consent.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUploading}>
                  {selectedParentDoc ? 'Save Version' : 'Save Document to Vault'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
