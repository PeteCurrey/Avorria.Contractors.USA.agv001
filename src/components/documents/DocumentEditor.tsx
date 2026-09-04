'use client';

import React, { useState } from 'react';
import { UniversalDocumentPayload, DocumentSection } from '@/lib/documents/types';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface DocumentEditorProps {
  document: {
    id: string;
    title: string;
    documentType: string;
    documentStatus: string;
    generationMethod: 'ai' | 'template' | 'manual';
    generationModel?: string;
    versionNumber: number;
    payload: UniversalDocumentPayload;
    disclaimer?: string;
  };
  requiresHumanReview: boolean;
  onSaveDraft: (payload: UniversalDocumentPayload, title: string) => Promise<void>;
  onFinalize: (reviewerName: string, acknowledged: boolean) => Promise<void>;
  onCreateVersion?: () => Promise<void>;
}

export function DocumentEditor({
  document,
  requiresHumanReview,
  onSaveDraft,
  onFinalize,
  onCreateVersion,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [sections, setSections] = useState<DocumentSection[]>(document.payload.sections || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState(document.payload.signOff?.signeeName || '');
  const [reviewAck, setReviewAck] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isFinal = document.documentStatus === 'final' || document.documentStatus === 'superseded';

  const handleSaveDraft = async () => {
    if (isFinal) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updatedPayload: UniversalDocumentPayload = {
        ...document.payload,
        title,
        sections,
      };
      await onSaveDraft(updatedPayload, title);
      setSaveMessage('Draft saved successfully.');
    } catch {
      setSaveMessage('Error saving draft. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!reviewAck && requiresHumanReview) {
      setReviewError('You must confirm review before finalising this document.');
      return;
    }
    setIsFinalizing(true);
    setReviewError(null);
    try {
      await onFinalize(reviewerName, reviewAck || !requiresHumanReview);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to finalize document.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSectionContentChange = (sectionId: string, content: string) => {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, content } : s));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Document Header */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          {isFinal ? (
            <h2 className="text-lg font-black text-white">{title}</h2>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-black text-white focus:outline-none border-b border-transparent hover:border-brand-500 focus:border-brand-500 pb-0.5"
            />
          )}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <Badge variant={document.generationMethod === 'ai' ? 'verified' : 'neutral'} size="sm">
              {document.generationMethod === 'ai' ? 'AI-Generated Draft' : document.generationMethod === 'template' ? 'Template-Assisted Draft' : 'Manually Created'}
            </Badge>
            <Badge variant={isFinal ? 'current' : 'primary'} size="sm">
              {document.documentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="font-mono text-slate-400">v{document.versionNumber}.0</span>
            {document.generationModel && (
              <span className="text-slate-500 text-[10px]">via {document.generationModel}</span>
            )}
          </div>
        </div>

        {!isFinal && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSaveDraft} isLoading={isSaving}>
              Save Draft
            </Button>
          </div>
        )}

        {isFinal && onCreateVersion && (
          <Button size="sm" variant="secondary" onClick={onCreateVersion}>
            + Create New Version
          </Button>
        )}
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
          {saveMessage}
        </div>
      )}

      {/* Editable Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} variant="default" className="space-y-3">
            <CardTitle className="text-sm font-bold text-white">{section.title}</CardTitle>

            {section.type === 'text' && (
              <Textarea
                label=""
                rows={4}
                value={section.content}
                onChange={(e) => handleSectionContentChange(section.id, e.target.value)}
                disabled={isFinal}
                className={isFinal ? 'opacity-70 cursor-not-allowed' : ''}
              />
            )}

            {section.type === 'checklist' && section.checklistData && (
              <div className="space-y-2">
                {section.checklistData.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={isFinal}
                      onChange={(e) => {
                        if (isFinal) return;
                        setSections((prev) => prev.map((s) => {
                          if (s.id !== section.id || !s.checklistData) return s;
                          const updated = [...s.checklistData];
                          updated[idx] = { ...updated[idx], checked: e.target.checked };
                          return { ...s, checklistData: updated };
                        }));
                      }}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className={item.checked ? 'text-slate-200' : 'text-slate-400'}>{item.label}</span>
                  </label>
                ))}
              </div>
            )}

            {section.type === 'table' && section.tableData && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {section.tableData.headers.map((h, i) => (
                        <th key={i} className="text-left py-2 px-3 text-slate-400 font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableData.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2 px-3 text-slate-300 align-top">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Financial Summary (Quotes / Change Orders) */}
      {document.payload.financialSummary && (
        <Card variant="default" className="space-y-3">
          <CardTitle className="text-sm">Financial Summary</CardTitle>
          <div className="text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono text-white">${document.payload.financialSummary.subtotal.toFixed(2)}</span></div>
            {document.payload.financialSummary.taxRatePercent !== undefined && (
              <div className="flex justify-between"><span>Tax ({document.payload.financialSummary.taxRatePercent}%):</span><span className="font-mono text-white">${(document.payload.financialSummary.taxAmount || 0).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between border-t border-surface-border pt-2 font-bold text-white">
              <span>Total (USD):</span>
              <span className="font-mono text-xl text-brand-400">${document.payload.financialSummary.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Human Review Gate */}
      {!isFinal && (
        <Card variant="elevated" className="border-brand-500/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <CardTitle className="text-base">
              {requiresHumanReview ? 'Mandatory Review Gate' : 'Finalise Document'}
            </CardTitle>
          </div>

          {requiresHumanReview && (
            <p className="text-xs text-slate-300 leading-relaxed">
              Before finalising, you must confirm this document has been reviewed and verified against actual conditions. This is a mandatory step and cannot be bypassed.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Reviewing Supervisor / Authorized Lead"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Full name of responsible person"
              required
            />

            {requiresHumanReview && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewAck}
                    onChange={(e) => setReviewAck(e.target.checked)}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <span>I confirm this document has been reviewed and verified for actual site/project conditions.</span>
                </label>
              </div>
            )}
          </div>

          {reviewError && (
            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {reviewError}
            </div>
          )}

          {document.disclaimer && (
            <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-[11px] text-slate-400 leading-relaxed">
              {document.disclaimer}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-surface-border">
            <Button type="button" variant="primary" size="md" onClick={handleFinalize} isLoading={isFinalizing}>
              {requiresHumanReview ? 'Sign & Finalise Document ✓' : 'Finalise Document ✓'}
            </Button>
          </div>
        </Card>
      )}

      {/* Final Locked Notice */}
      {isFinal && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 text-center">
          ✓ This document is finalised and locked. Create a new version to make changes.
        </div>
      )}
    </div>
  );
}
