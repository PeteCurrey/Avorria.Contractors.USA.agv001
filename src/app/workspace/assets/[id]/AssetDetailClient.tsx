'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Asset,
  AssetDocument,
  ServiceLog,
  SparePart,
  AssetDocumentType,
  ASSET_DOCUMENT_TYPES,
  ASSET_DOCUMENT_TYPE_LABELS,
  ASSET_TYPE_LABELS,
  ASSET_STATUS_LABELS,
} from '@/lib/assets/types';
import { Organization, WorkspaceUser } from '@/lib/workspace/types';
import { uploadFileToSignedUrl, isFirebaseConfigured } from '@/lib/firebase/client';

interface AssetDetailClientProps {
  organization: Organization;
  user: WorkspaceUser;
  asset: Asset;
  initialDocuments: AssetDocument[];
  initialServiceLogs: ServiceLog[];
  compatibleParts: SparePart[];
  allParts: SparePart[];
}

interface UploadQueueItem {
  id: string;
  file: File;
  documentType: AssetDocumentType;
  status: 'queued' | 'requesting_url' | 'uploading' | 'confirming' | 'done' | 'failed';
  percent: number;
  error?: string;
  storagePath?: string;
  signedUrl?: string;
}

export function AssetDetailClient({
  organization,
  user,
  asset,
  initialDocuments,
  initialServiceLogs,
  compatibleParts,
  allParts,
}: AssetDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'service_logs' | 'parts'>('documents');
  const [documents, setDocuments] = useState<AssetDocument[]>(initialDocuments);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>(initialServiceLogs);
  const [expandedDocText, setExpandedDocText] = useState<string | null>(null);

  // Upload state
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<AssetDocumentType>('manual');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Service Log Form state
  const [showAddLog, setShowAddLog] = useState(false);
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [newLog, setNewLog] = useState<{
    service_date: string;
    technician_name: string;
    work_performed: string;
    parts_used: string[];
    cost: string;
  }>({
    service_date: new Date().toISOString().split('T')[0],
    technician_name: user.full_name || '',
    work_performed: '',
    parts_used: [],
    cost: '',
  });

  // ─────────────────────────────────────────────────────────────
  // UPLOAD PIPELINE
  // ─────────────────────────────────────────────────────────────

  function handleFilesSelected(files: FileList | null, docType: AssetDocumentType) {
    if (!files || files.length === 0) return;

    const newItems: UploadQueueItem[] = Array.from(files).map((f) => ({
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      documentType: docType,
      status: 'queued',
      percent: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => executeUpload(item));
  }

  async function executeUpload(item: UploadQueueItem) {
    updateQueueItem(item.id, { status: 'requesting_url', percent: 10 });

    try {
      // 1. Request signed URL from server (scoped to org/asset)
      const reqRes = await fetch('/api/assets/upload/request-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          fileName: item.file.name,
          mimeType: item.file.type || 'application/octet-stream',
        }),
      });

      if (!reqRes.ok) {
        const err = await reqRes.json();
        throw new Error(err.error || 'Failed to request upload URL');
      }

      const { signedUrl, storagePath } = await reqRes.json();
      updateQueueItem(item.id, {
        status: 'uploading',
        percent: 25,
        storagePath,
        signedUrl,
      });

      // 2. Upload file directly to Firebase Storage (or mock if not configured)
      if (isFirebaseConfigured()) {
        await uploadFileToSignedUrl(signedUrl, item.file, (progress) => {
          updateQueueItem(item.id, {
            percent: Math.min(90, Math.max(25, progress.percent)),
          });
        });
      } else {
        // Mock upload delay for test/local environments
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      updateQueueItem(item.id, { status: 'confirming', percent: 95 });

      // 3. Confirm upload with server route — sole writer of asset_documents
      const confirmRes = await fetch('/api/assets/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          storagePath,
          documentType: item.documentType,
          fileName: item.file.name,
          mimeType: item.file.type || 'application/octet-stream',
          fileSizeBytes: item.file.size,
        }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.error || 'Server rejected upload confirmation');
      }

      const { assetDocument } = await confirmRes.json();
      updateQueueItem(item.id, { status: 'done', percent: 100 });
      setDocuments((prev) => [assetDocument, ...prev]);
    } catch (err: any) {
      updateQueueItem(item.id, {
        status: 'failed',
        error: err.message || 'Upload failed',
      });
    }
  }

  function updateQueueItem(id: string, updates: Partial<UploadQueueItem>) {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function retryUpload(item: UploadQueueItem) {
    executeUpload(item);
  }

  function clearCompletedUploads() {
    setUploadQueue((prev) => prev.filter((i) => i.status !== 'done'));
  }

  // ─────────────────────────────────────────────────────────────
  // SERVICE LOG SUBMISSION
  // ─────────────────────────────────────────────────────────────

  async function handleAddServiceLog(e: React.FormEvent) {
    e.preventDefault();
    if (!newLog.technician_name || !newLog.work_performed) {
      setLogError('Technician name and work performed description are required.');
      return;
    }

    setLogSubmitting(true);
    setLogError(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}/service-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_date: newLog.service_date,
          technician_name: newLog.technician_name,
          work_performed: newLog.work_performed,
          parts_used: newLog.parts_used,
          cost: newLog.cost ? parseFloat(newLog.cost) : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save service log');
      }

      const { log } = await res.json();
      setServiceLogs([log, ...serviceLogs]);
      setShowAddLog(false);
      setNewLog({
        service_date: new Date().toISOString().split('T')[0],
        technician_name: user.full_name || '',
        work_performed: '',
        parts_used: [],
        cost: '',
      });
    } catch (err: any) {
      setLogError(err.message || 'Error saving service log');
    } finally {
      setLogSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Link href="/workspace/assets" className="hover:text-slate-300">
          ← ASSETS DIRECTORY
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{asset.name}</span>
      </div>

      {/* Asset Overview Card */}
      <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                {ASSET_TYPE_LABELS[asset.asset_type]}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {asset.manufacturer}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{asset.name}</h1>
          </div>

          <span
            className={`text-xs font-mono uppercase px-3 py-1 self-start border ${
              asset.status === 'active'
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                : asset.status === 'in_repair'
                ? 'border-amber-500/40 bg-amber-950/20 text-amber-400'
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}
          >
            {ASSET_STATUS_LABELS[asset.status]}
          </span>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">MODEL</span>
            <span className="text-slate-200">{asset.model_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">SERIAL NUMBER</span>
            <span className="text-slate-200">{asset.serial_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">LOCATION</span>
            <span className="text-slate-200">{asset.current_location || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase">WARRANTY</span>
            <span
              className={
                asset.warranty_expiration && new Date(asset.warranty_expiration) < new Date()
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }
            >
              {asset.warranty_expiration || 'Not recorded'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors ${
            activeTab === 'documents'
              ? 'border-sky-500 text-sky-400 bg-sky-950/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          DOCUMENTS & MEDIA ({documents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('service_logs')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors ${
            activeTab === 'service_logs'
              ? 'border-sky-500 text-sky-400 bg-sky-950/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          SERVICE LOG ({serviceLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parts')}
          className={`px-4 py-2.5 border-b-2 font-bold uppercase transition-colors ${
            activeTab === 'parts'
              ? 'border-sky-500 text-sky-400 bg-sky-950/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          COMPATIBLE PARTS ({compatibleParts.length})
        </button>
      </div>

      {/* ── TAB 1: DOCUMENTS & MEDIA UPLOAD ZONE ── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Upload Zone */}
          <div className="bg-[#090d16] border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                  UPLOAD TECHNICAL DOCUMENT OR PHOTO
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct Firebase Storage upload. Extracted text is indexed with pgvector for instant site queries.
                </p>
              </div>

              {/* Document Type Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-500">TYPE:</span>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as AssetDocumentType)}
                  className="bg-[#030712] border border-slate-800 text-slate-200 text-xs font-mono px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
                >
                  {ASSET_DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ASSET_DOCUMENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drop Zone Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFilesSelected(e.dataTransfer.files, selectedDocType);
              }}
              className={`border-2 border-dashed p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-sky-500 bg-sky-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-[#030712]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/*,text/plain"
                onChange={(e) => handleFilesSelected(e.target.files, selectedDocType)}
                className="hidden"
              />

              {/* Mobile-first camera capture input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFilesSelected(e.target.files, selectedDocType)}
                className="hidden"
              />

              <div className="space-y-3">
                <div className="text-slate-400 font-mono text-xs">
                  Drag & drop PDF manuals, spec sheets, or warranty files
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-sky-500 text-slate-200 hover:text-white font-mono text-xs uppercase transition-colors"
                  >
                    Browse Files (PDF/Images)
                  </button>

                  {/* Direct Camera Capture Button (Field Use) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 bg-sky-950/40 border border-sky-500/60 hover:bg-sky-900/40 text-sky-400 hover:text-sky-300 font-mono text-xs uppercase flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeWidth="2" />
                    </svg>
                    <span>Take Field Photo</span>
                  </button>
                </div>

                <div className="text-[10px] font-mono text-slate-600">
                  Batch multi-select supported. Single files up to 50MB.
                </div>
              </div>
            </div>

            {/* Upload Queue Progress List */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    UPLOAD QUEUE ({uploadQueue.length})
                  </span>
                  <button
                    type="button"
                    onClick={clearCompletedUploads}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
                  >
                    Clear done
                  </button>
                </div>

                <div className="space-y-2">
                  {uploadQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#030712] border border-slate-800 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 truncate max-w-xs sm:max-w-md">
                          {item.file.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold ${
                              item.status === 'done'
                                ? 'text-emerald-400'
                                : item.status === 'failed'
                                ? 'text-rose-400'
                                : 'text-sky-400'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>

                          {item.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => retryUpload(item)}
                              className="text-[10px] text-sky-400 underline"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-900 h-1">
                        <div
                          className={`h-1 transition-all duration-300 ${
                            item.status === 'done'
                              ? 'bg-emerald-500'
                              : item.status === 'failed'
                              ? 'bg-rose-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>

                      {item.error && (
                        <div className="text-[10px] text-rose-400">{item.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              STORED ASSET DOCUMENTS ({documents.length})
            </span>

            {documents.length === 0 ? (
              <div className="p-8 text-center bg-[#090d16] border border-slate-800 text-slate-500 font-mono text-xs">
                No documents uploaded for this asset yet.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                          {ASSET_DOCUMENT_TYPE_LABELS[doc.document_type]}
                        </span>
                        <span className="text-sm font-bold text-slate-200 truncate">
                          {doc.file_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                        {/* Extraction Status */}
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                            doc.extraction_status === 'complete'
                              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                              : doc.extraction_status === 'pending'
                              ? 'border-amber-500/40 bg-amber-950/20 text-amber-400'
                              : 'border-slate-800 bg-slate-900 text-slate-500'
                          }`}
                        >
                          OCR/Vector: {doc.extraction_status}
                        </span>

                        {/* View in Storage direct link */}
                        <a
                          href={doc.firebase_storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-sky-500 text-sky-400 hover:text-sky-300 text-[11px]"
                        >
                          View Original ↗
                        </a>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                      <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      {doc.file_size_bytes && (
                        <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                      )}
                      {doc.extracted_text && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDocText(
                              expandedDocText === doc.id ? null : doc.id
                            )
                          }
                          className="text-sky-500 hover:underline"
                        >
                          {expandedDocText === doc.id ? 'Hide Text' : 'Preview Extracted Text'}
                        </button>
                      )}
                    </div>

                    {/* Extracted Text Collapsible Preview */}
                    {expandedDocText === doc.id && doc.extracted_text && (
                      <div className="mt-2 p-3 bg-[#030712] border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {doc.extracted_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SERVICE LOG TAB ── */}
      {activeTab === 'service_logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
              MAINTENANCE & SERVICE HISTORY
            </span>
            <button
              type="button"
              onClick={() => setShowAddLog(!showAddLog)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs uppercase transition-colors"
            >
              {showAddLog ? 'Cancel' : '+ Add Service Entry'}
            </button>
          </div>

          {/* Inline Add Service Entry Form */}
          {showAddLog && (
            <div className="bg-[#090d16] border border-sky-500/50 p-5 space-y-4">
              <span className="font-mono text-xs font-bold uppercase text-sky-400 block border-b border-slate-800 pb-2">
                RECORD SERVICE LOG ENTRY
              </span>

              {logError && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/40 text-rose-400 text-xs font-mono">
                  {logError}
                </div>
              )}

              <form onSubmit={handleAddServiceLog} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newLog.service_date}
                      onChange={(e) => setNewLog({ ...newLog, service_date: e.target.value })}
                      className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">
                      Technician Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Fleet Tech"
                      value={newLog.technician_name}
                      onChange={(e) => setNewLog({ ...newLog, technician_name: e.target.value })}
                      className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2 font-sans focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase">
                      Total Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newLog.cost}
                      onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })}
                      className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 uppercase">
                    Work Performed (Detailed) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe maintenance, oil change, filter replacement, torque inspections, or repairs completed..."
                    value={newLog.work_performed}
                    onChange={(e) => setNewLog({ ...newLog, work_performed: e.target.value })}
                    className="w-full bg-[#030712] border border-slate-800 focus:border-sky-500 text-sm text-slate-200 p-2.5 font-sans focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-slate-500 block">
                    This work text will automatically be indexed into vector search.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={logSubmitting}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase transition-colors"
                  >
                    {logSubmitting ? 'SAVING...' : 'SAVE SERVICE ENTRY'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Service Log Entries */}
          {serviceLogs.length === 0 ? (
            <div className="p-8 text-center bg-[#090d16] border border-slate-800 text-slate-500 font-mono text-xs">
              No service logs recorded yet. Click &quot;+ Add Service Entry&quot; to add maintenance records.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 bg-[#090d16] border border-slate-800 space-y-2 font-sans text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-sky-400 font-bold">{log.service_date}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{log.technician_name}</span>
                    </div>

                    {log.cost !== undefined && log.cost !== null && (
                      <span className="font-mono text-slate-300">
                        ${Number(log.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed">{log.work_performed}</p>

                  {log.parts_used && log.parts_used.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">PARTS:</span>
                      {log.parts_used.map((part, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: COMPATIBLE PARTS TAB ── */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
              COMPATIBLE SPARE PARTS ({compatibleParts.length})
            </span>
            <Link
              href="/workspace/assets/parts"
              className="text-xs font-mono text-sky-400 hover:underline"
            >
              Open Parts Inventory →
            </Link>
          </div>

          {compatibleParts.length === 0 ? (
            <div className="p-8 text-center bg-[#090d16] border border-slate-800 text-slate-500 font-mono text-xs space-y-2">
              <div>No spare parts are mapped to this asset yet.</div>
              <Link
                href="/workspace/assets/parts"
                className="inline-block px-3 py-1.5 border border-slate-800 text-slate-300 hover:text-white uppercase text-[11px]"
              >
                Go to Spares Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {compatibleParts.map((part) => (
                <div
                  key={part.id}
                  className="p-4 bg-[#090d16] border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400 font-bold">#{part.part_number}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 border ${
                        part.quantity_on_hand <= part.reorder_threshold
                          ? 'border-rose-500/40 bg-rose-950/20 text-rose-400'
                          : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                      }`}
                    >
                      {part.quantity_on_hand <= part.reorder_threshold ? 'REORDER NEEDED' : 'IN STOCK'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-200">{part.description}</div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>QTY: {part.quantity_on_hand}</span>
                    <span>REORDER AT: {part.reorder_threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
