'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceDocument, WorkspaceDocumentType } from '@/lib/workspace/types';

interface DocumentsClientProps {
  organization: Organization;
  initialDocuments: WorkspaceDocument[];
}

export function DocumentsClient({ organization: _org, initialDocuments }: DocumentsClientProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<WorkspaceDocument[]>(initialDocuments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkspaceDocumentType>('safety_plan');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let fileUrl: string | undefined;

      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        const uploadRes = await fetch('/api/workspace/credentials/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        fileUrl = uploadData.fileUrl;
      }

      const res = await fetch('/api/workspace/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          file_url: fileUrl,
          version: 1,
          generated_by: 'uploaded',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save document');

      setDocuments((prev) => [data.document, ...prev]);
      setIsModalOpen(false);
      setTitle('');
      setUploadFile(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
        >
          + Upload Document
        </button>

        <span className="text-xs font-mono text-slate-400">
          TOTAL DOCUMENTS: {documents.length}
        </span>
      </div>

      <div className="border border-slate-800 bg-[#090d16]">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 font-mono">
            No documents in archive. Upload your site safety plan or Job Hazard Analysis (JHA).
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#090d16] hover:bg-slate-900/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-sans">{doc.title}</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                      v{doc.version}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                    <span className="text-sky-400 uppercase">{doc.type.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>SOURCE: {doc.generated_by.toUpperCase()}</span>
                    <span>•</span>
                    <span>UPLOADED: {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 bg-[#030712] text-xs font-mono text-sky-400"
                    >
                      View File ↗
                    </a>
                  ) : (
                    <span className="text-slate-600 font-mono text-[10px]">No file attached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-700 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Upload Operational Document
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Document Title <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Site-Specific Health & Safety Plan (HASP) 2026"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Document Category <span className="text-sky-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WorkspaceDocumentType)}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                >
                  <option value="safety_plan">Site Safety Plan (HASP)</option>
                  <option value="jha">Job Hazard Analysis (JHA)</option>
                  <option value="jsa">Job Safety Analysis (JSA)</option>
                  <option value="toolbox_talk">Toolbox Talk Attendance Record</option>
                  <option value="quote">Commercial Quote</option>
                  <option value="change_order">Change Order</option>
                  <option value="other">Other Operational Record</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  File Attachment (PDF, DOCX, Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.png,.jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-400 font-mono text-[11px] file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-700 file:text-xs file:font-mono file:bg-[#030712] file:text-slate-300 hover:file:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
