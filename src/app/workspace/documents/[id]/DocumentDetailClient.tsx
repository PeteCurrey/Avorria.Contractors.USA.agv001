'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceUser, WorkspaceDocument } from '@/lib/workspace/types';

interface DocumentDetailClientProps {
  document: WorkspaceDocument;
  organization: Organization;
  user: WorkspaceUser;
  versionHistory: WorkspaceDocument[];
}

export function DocumentDetailClient({
  document: initialDoc,
  organization,
  user,
  versionHistory,
}: DocumentDetailClientProps) {
  const router = useRouter();
  const [doc, setDoc] = useState(initialDoc);

  // Digital Signature Modal
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState(user.full_name || '');
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Toolbox Talk Attendance State
  const [attendanceTopic, setAttendanceTopic] = useState(doc.title);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);


  // Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExecuteSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !signerName.trim()) return;

    setIsSigning(true);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');
      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          signatureImage: signatureDataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signing failed');

      setDoc(data.document);
      setShowSignModal(false);
      setActionError(null);
      router.refresh();
    } catch (err: any) {
      setActionError(`Signature failed: ${err.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  const handleAddAttendee = () => {
    if (attendeeName.trim()) {
      setAttendees([...attendees, attendeeName.trim()]);
      setAttendeeName('');
    }
  };

  const handleSaveAttendance = async () => {
    if (attendees.length === 0) return;
    setIsSavingAttendance(true);
    setActionError(null);
    try {
      const res = await fetch('/api/workspace/toolbox-talks/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: doc.title,
          attendee_names: attendees,
          document_id: doc.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');
      setAttendanceSaved(true);
    } catch (err: any) {
      setActionError(`Attendance error: ${err.message}`);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Action error banner */}
      {actionError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-sm text-red-300">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-300 font-bold text-xs uppercase tracking-wide shrink-0">Dismiss</button>
        </div>
      )}
      {/* Top Header */}
      <div className="bg-[#090d16] border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/workspace/documents" className="text-xs font-mono text-slate-500 hover:text-sky-400 transition-colors uppercase">
              ← Document Vault
            </Link>
            <span className="text-slate-700">/</span>
            <span className="font-mono text-xs font-bold text-sky-400 uppercase">
              v{doc.version}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {doc.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-1">
            <span>TYPE: {doc.type.toUpperCase()}</span>
            <span>•</span>
            <span>PROVENANCE: {doc.generated_by.toUpperCase()}</span>
            <span>•</span>
            <span>CREATED: {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/documents/${doc.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <span>Download PDF</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>

          {!doc.is_signed && (
            <button
              type="button"
              onClick={() => setShowSignModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              Sign & Lock
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Preview & Version History Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Full Document Render & Signature Seal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Seal Banner */}
          {doc.is_signed && doc.signature_data ? (
            <div className="bg-emerald-950/40 border border-emerald-800 p-4 font-mono text-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
                  <span>✓</span>
                  <span>DIGITALLY EXECUTED & LOCKED (IMMUTABLE)</span>
                </div>
                <div className="text-slate-400">
                  Signed by <span className="text-white font-bold">{doc.signature_data.signer_name}</span> at {new Date(doc.signature_data.signed_at).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  SHA-256 IP HASH: {doc.signature_data.signer_ip_hash}
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase">
                VERIFIED
              </span>
            </div>
          ) : (
            <div className="bg-amber-950/30 border border-amber-800/80 p-4 font-mono text-xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-amber-400 font-bold uppercase">
                  DOCUMENT STATUS: DRAFT / UNSIGNED
                </div>
                <div className="text-slate-400 text-[11px]">
                  This document has not been digitally executed. Sign to lock and establish legal audit verification.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase text-[10px]"
              >
                Sign Now
              </button>
            </div>
          )}

          {/* Structured Document Body Render */}
          <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              DOCUMENT PAYLOAD (STRUCTURED JSON CONTENT)
            </h2>
            <div className="bg-[#030712] border border-slate-900 p-4 max-h-[600px] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(doc.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Toolbox Talk Attendance Section (if applicable) */}
          {doc.type === 'toolbox_talk' && (
            <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CREW ATTENDANCE & SIGN-IN SHEET
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  +10 PTS COMPLIANCE LOG BOOST
                </span>
              </div>

              {attendanceSaved ? (
                <div className="bg-emerald-950/40 border border-emerald-800 p-4 font-mono text-xs text-emerald-300">
                  ✓ Attendance roster recorded for {attendees.length} crew members into compliance ledger.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAttendee()}
                      placeholder="Enter crew member name"
                      className="flex-1 bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttendee}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 uppercase font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  {attendees.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] text-slate-500 uppercase">ATTENDING TECHNICIANS ({attendees.length}):</div>
                      <div className="flex flex-wrap gap-2">
                        {attendees.map((name, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                            <span>{name}</span>
                            <button
                              type="button"
                              onClick={() => setAttendees(attendees.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          disabled={isSavingAttendance}
                          onClick={handleSaveAttendance}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[11px]"
                        >
                          {isSavingAttendance ? 'Saving...' : 'Save Crew Roster to Ledger'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Version History & Audit Trail */}
        <div className="space-y-6">
          <div className="bg-[#090d16] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                VERSION HISTORY ({versionHistory.length})
              </h3>
              <Link
                href={`/workspace/create/${doc.type}`}
                className="text-[10px] font-mono text-sky-400 hover:underline uppercase"
              >
                + New Version
              </Link>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {versionHistory.map((ver) => {
                const isCurrent = ver.id === doc.id;
                return (
                  <div
                    key={ver.id}
                    className={`p-3 border ${
                      isCurrent
                        ? 'bg-[#111c30] border-sky-500/60'
                        : 'bg-[#030712] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${isCurrent ? 'text-sky-400' : 'text-slate-300'}`}>
                        v{ver.version} {isCurrent && '(Viewing)'}
                      </span>
                      {ver.is_signed ? (
                        <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] uppercase font-bold">
                          Signed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 text-[9px] uppercase">
                          Draft
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      {new Date(ver.created_at).toLocaleString()}
                    </div>

                    {ver.change_summary && (
                      <div className="text-[11px] text-slate-400 mt-1.5 font-sans">
                        {ver.change_summary}
                      </div>
                    )}

                    {!isCurrent && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <Link
                          href={`/workspace/documents/${ver.id}`}
                          className="text-[10px] text-sky-400 hover:underline uppercase"
                        >
                          Switch to v{ver.version} →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#090d16] border border-slate-800 max-w-lg w-full p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                DIGITAL SIGNATURE EXECUTION
              </h3>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">SIGNER FULL NAME</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>DRAW SIGNATURE:</span>
                  <button type="button" onClick={clearCanvas} className="text-slate-500 hover:text-slate-300">
                    CLEAR
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full bg-[#030712] border border-slate-700 cursor-crosshair h-32"
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed">
                Executing locks this document version permanently. SHA-256 IP hash will be recorded.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white uppercase text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSigning || !signerName.trim()}
                onClick={handleExecuteSignature}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold uppercase text-xs"
              >
                {isSigning ? 'Executing...' : 'Confirm & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
