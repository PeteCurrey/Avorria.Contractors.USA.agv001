'use client';

/**
 * AVORRIA — COMPLIANCE ASSISTANT WIDGET
 * (Ask Avorria Q&A + Photo Compliance Inspection)
 *
 * One unified feature with two input modes:
 *  1. Text Q&A: Contractor asks questions grounded in OSHA 1926/1910 and their profile context.
 *  2. Photo Inspection: Contractor uploads job-site photo with specific inspection query.
 *
 * Enforces:
 *  - Clear user-facing error if image is rejected (file type or >10MB).
 *  - Loading states during analysis.
 *  - Legal/safety disclaimer adjacent to EVERY individual answer.
 *  - Independent "Save to workspace" action with toast confirmation.
 *  - Saved photo items store storagePath so photo stays attached.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citedStandards: string[];
  modelUsed: string;
  threadId: string | null;
  messageId: string | null;
  createdAt: string;
}

interface PhotoAnalysisResult {
  queryId: string;
  question: string;
  answer: string;
  citedStandards: string[];
  modelUsed: string;
  storagePath: string;
  tradeContext: string;
  stateContext: string;
  stateName?: string;
  createdAt: string;
  localPreviewUrl?: string;
  filename: string;
}

interface WorkspaceContext {
  tradeContext: string;
  stateContext: string;
  stateName: string;
}

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error';
}

type InputMode = 'text' | 'photo';

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPLIANCE_DISCLAIMER =
  'Informational guidance only — grounded in federal OSHA 1926/1910 and jurisdictional licensing rules. Not legal advice, an official OSHA determination, a compliance certification, or a guarantee of regulatory compliance.';

const QUICK_TEXT_PROMPTS = [
  'What fall protection is required when working at 6 feet on a construction site?',
  'Do I need a separate license for residential and commercial electrical work in my state?',
  'What are the OSHA requirements for scaffold tie-ins on buildings over 26 feet?',
  'When is a site-specific safety plan required vs. a standard HASP?',
];

const QUICK_PHOTO_PROMPTS = [
  'Does this scaffold tie-in setup appear to meet OSHA 1926.451 requirements?',
  'Check this portable ladder setup for proper 4:1 pitch and side-rail extension.',
  'Identify this electrical conduit fitting and state if an inspection permit is required.',
  'Are there visible housekeeping or walking/working surface hazards in this corridor?',
];

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// ─── Component ────────────────────────────────────────────────────────────────

export function AskAvorriaWidget() {
  const [mode, setMode] = useState<InputMode>('text');

  // Text Mode State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Photo Mode State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoInput, setPhotoInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoResults, setPhotoResults] = useState<PhotoAnalysisResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Shared State
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [savedPhotoQueryIds, setSavedPhotoQueryIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, photoResults, isTextLoading, isAnalyzing]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const showToast = useCallback((text: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  // ── File Selection & Validation ────────────────────────────────────────────
  const handleFileChange = useCallback((file: File | null) => {
    setPhotoError(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Constraint 1: File Type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setPhotoError(`Unsupported file type "${file.type || file.name}". Supported formats: JPEG, PNG, WebP, GIF.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Constraint 2: Max Size (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setPhotoError(`File size (${sizeMb}MB) exceeds the maximum allowed limit of 10MB.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  // ── Text Mode: Send Question ───────────────────────────────────────────────
  const sendTextQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isTextLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        citedStandards: [],
        modelUsed: '',
        threadId: null,
        messageId: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setTextInput('');
      setIsTextLoading(true);
      setGeneralError(null);

      try {
        const res = await fetch('/api/compliance/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: trimmed, threadId }),
        });

        const json = await res.json();

        if (!res.ok) {
          const errorText =
            json.code === 'NO_API_KEY'
              ? 'The compliance AI service is not yet configured. Please contact your workspace administrator.'
              : json.error ?? 'Something went wrong. Please try again.';
          setGeneralError(errorText);
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }

        if (!context) {
          setContext({
            tradeContext: json.tradeContext,
            stateContext: json.stateContext,
            stateName: json.stateName,
          });
        }

        if (!threadId) setThreadId(json.threadId);

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: json.answer,
          citedStandards: json.citedStandards ?? [],
          modelUsed: json.modelUsed,
          threadId: json.threadId,
          messageId: json.messageId,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setGeneralError('Network error. Please check your connection and try again.');
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      } finally {
        setIsTextLoading(false);
      }
    },
    [isTextLoading, threadId, context]
  );

  // ── Photo Mode: Upload & Analyze ───────────────────────────────────────────
  const submitPhotoAnalysis = useCallback(async () => {
    if (!selectedFile) {
      setPhotoError('Please select or drop a job-site photo before analyzing.');
      return;
    }

    const question = photoInput.trim();
    if (!question) {
      setPhotoError('Please enter a question or specify what to inspect in this photo.');
      return;
    }

    setPhotoError(null);
    setIsUploading(true);
    setIsAnalyzing(false);

    try {
      // Step 1: Upload Photo to Private Storage
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch('/api/compliance/photo/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setPhotoError(uploadData.error || 'Photo upload failed.');
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Step 2: Analyze Photo with Vision AI
      const analyzeRes = await fetch('/api/compliance/photo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: uploadData.storagePath,
          question,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        setPhotoError(analyzeData.error || 'Vision analysis failed.');
        setIsAnalyzing(false);
        return;
      }

      if (!context && analyzeData.tradeContext) {
        setContext({
          tradeContext: analyzeData.tradeContext,
          stateContext: analyzeData.stateContext,
          stateName: analyzeData.stateName,
        });
      }

      const result: PhotoAnalysisResult = {
        queryId: analyzeData.queryId,
        question,
        answer: analyzeData.answer,
        citedStandards: analyzeData.citedStandards || [],
        modelUsed: analyzeData.modelUsed,
        storagePath: analyzeData.storagePath,
        tradeContext: analyzeData.tradeContext,
        stateContext: analyzeData.stateContext,
        stateName: analyzeData.stateName,
        createdAt: new Date().toISOString(),
        localPreviewUrl: previewUrl || undefined,
        filename: selectedFile.name,
      };

      setPhotoResults((prev) => [result, ...prev]);

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setPhotoInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setPhotoError('Network error processing photo compliance inspection.');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }, [selectedFile, photoInput, previewUrl, context]);

  // ── Save Text Answer to Workspace ──────────────────────────────────────────
  const saveTextAnswer = useCallback(
    async (msg: ChatMessage) => {
      if (!msg.messageId || savedMessageIds.has(msg.messageId)) return;

      const msgIndex = messages.findIndex((m) => m.id === msg.id);
      const preceding = msgIndex > 0 ? messages[msgIndex - 1] : null;
      const question = preceding?.role === 'user' ? preceding.content : '(question not available)';

      try {
        const res = await fetch('/api/compliance/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ask_avorria_answer',
            question,
            answer: msg.content,
            citedStandards: msg.citedStandards,
            tradeContext: context?.tradeContext ?? '',
            stateContext: context?.stateContext ?? '',
            modelUsed: msg.modelUsed,
            sourceThreadId: msg.threadId ?? threadId ?? '',
          }),
        });

        if (res.ok) {
          setSavedMessageIds((prev) => new Set([...prev, msg.messageId!]));
          showToast('Saved answer to workspace ✓');
        } else {
          showToast('Failed to save — please try again.', 'error');
        }
      } catch {
        showToast('Network error saving answer.', 'error');
      }
    },
    [messages, context, threadId, savedMessageIds, showToast]
  );

  // ── Save Photo Answer to Workspace ─────────────────────────────────────────
  const savePhotoAnswer = useCallback(
    async (res: PhotoAnalysisResult) => {
      if (savedPhotoQueryIds.has(res.queryId)) return;

      try {
        const saveRes = await fetch('/api/compliance/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'photo_compliance_answer',
            question: res.question,
            answer: res.answer,
            citedStandards: res.citedStandards,
            tradeContext: res.tradeContext,
            stateContext: res.stateContext,
            modelUsed: res.modelUsed,
            sourceThreadId: res.queryId,
            storagePath: res.storagePath,
          }),
        });

        if (saveRes.ok) {
          setSavedPhotoQueryIds((prev) => new Set([...prev, res.queryId]));
          showToast('Saved photo inspection to workspace ✓');
        } else {
          showToast('Failed to save to workspace.', 'error');
        }
      } catch {
        showToast('Network error saving photo answer.', 'error');
      }
    },
    [savedPhotoQueryIds, showToast]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      id="ask-avorria"
      className="flex flex-col border border-surface-border rounded-xl bg-surface-card overflow-hidden min-h-[720px] relative"
    >
      {/* Header & Mode Switcher */}
      <div className="px-5 py-3.5 border-b border-surface-border bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-surface-elevated p-0.5 border border-surface-border text-xs">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>Ask Avorria</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('photo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                mode === 'photo'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📷</span>
              <span>Photo Inspection</span>
            </button>
          </div>

          <span className="hidden md:inline text-[11px] text-slate-500 font-mono">
            {mode === 'text' ? 'OSHA 1926/1910 Q&A' : 'Multimodal Vision Safety Analysis'}
          </span>
        </div>

        {/* Dynamic Context Pills */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-1 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono">
            {context?.tradeContext || 'Profile Trade Loaded'}
          </span>
          <span className="px-2 py-1 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono">
            {context?.stateName ? `${context.stateName} (${context.stateContext})` : 'State Scoped'}
          </span>
        </div>
      </div>

      {/* ── MODE 1: TEXT CHAT ─────────────────────────────────────────────── */}
      {mode === 'text' && (
        <>
          <div className="flex-1 overflow-y-auto p-5 space-y-5 max-h-[560px]">
            {messages.length === 0 && !isTextLoading && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask any compliance or licensing question. Your trade and state context are pulled
                  automatically from your Passport profile — every answer cites the standard it draws from.
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Quick Prompt Starters
                  </p>
                  {QUICK_TEXT_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendTextQuestion(prompt)}
                      className="w-full text-left text-xs px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface-subtle text-slate-300 hover:text-white hover:border-brand-600 hover:bg-brand-950/20 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] space-y-2.5">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated border border-surface-border">
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {msg.citedStandards.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-border">
                          {msg.citedStandards.map((std) => (
                            <span
                              key={std}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950/50 border border-brand-800/40 text-brand-300"
                            >
                              {std}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Disclaimer Adjacent to Every Assistant Message */}
                    <div className="px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[10px] text-amber-200/70 leading-relaxed">
                      <strong className="text-amber-200/90 font-mono">Compliance Notice: </strong>
                      {COMPLIANCE_DISCLAIMER}
                    </div>

                    {/* Action Bar */}
                    {msg.messageId && (
                      <div className="flex items-center gap-2 pl-1">
                        <button
                          type="button"
                          onClick={() => saveTextAnswer(msg)}
                          disabled={savedMessageIds.has(msg.messageId!)}
                          className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded transition-colors ${
                            savedMessageIds.has(msg.messageId!)
                              ? 'text-emerald-400 cursor-default bg-emerald-950/30 border border-emerald-800/30'
                              : 'text-slate-400 hover:text-white hover:bg-surface-elevated border border-surface-border'
                          }`}
                        >
                          {savedMessageIds.has(msg.messageId!) ? (
                            <span>✓ Saved to Workspace</span>
                          ) : (
                            <>
                              <span>⬇</span>
                              <span>Save to Workspace</span>
                            </>
                          )}
                        </button>
                        {msg.modelUsed && (
                          <span className="text-[10px] font-mono text-slate-500">
                            via {msg.modelUsed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTextLoading && (
              <div className="flex items-start gap-2">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated border border-surface-border">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Reviewing federal OSHA standards and jurisdictional licensing rules…
                  </div>
                </div>
              </div>
            )}

            {generalError && (
              <div className="px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300">
                {generalError}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Text Input Footer */}
          <div className="px-4 py-3 border-t border-surface-border bg-surface-subtle shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={textInputRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendTextQuestion(textInput);
                  }
                }}
                placeholder="Ask a compliance or licensing question…"
                rows={2}
                disabled={isTextLoading}
                className="flex-1 resize-none bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => sendTextQuestion(textInput)}
                disabled={isTextLoading || !textInput.trim()}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                Ask
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 pl-0.5">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}

      {/* ── MODE 2: PHOTO INSPECTION ──────────────────────────────────────── */}
      {mode === 'photo' && (
        <div className="flex-1 p-5 space-y-6 overflow-y-auto max-h-[660px]">
          {/* Upload Card */}
          <div className="p-5 rounded-xl bg-surface-elevated border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Upload Job-Site Photo</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyze scaffold tie-ins, ladder slope, conduit fittings, or hazard clearances.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card border border-surface-border text-slate-400">
                JPEG · PNG · WebP · Max 10MB
              </span>
            </div>

            {/* Drop Zone / Preview */}
            {!previewUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0] || null;
                  handleFileChange(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-brand-500 bg-brand-950/20'
                    : 'border-surface-border hover:border-slate-500 bg-surface-subtle'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="text-2xl mb-2">📷</div>
                <div className="text-xs font-semibold text-slate-200">
                  Click to select or drag job-site photo here
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Private storage scoped to your organization
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg bg-surface-card border border-surface-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Job-site inspection upload"
                  className="w-24 h-24 object-cover rounded-md border border-surface-border shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-bold text-white truncate">
                    {selectedFile?.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''} ·{' '}
                    {selectedFile?.type}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-medium pt-1"
                  >
                    Remove and choose another
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {photoError && (
              <div className="px-4 py-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300">
                {photoError}
              </div>
            )}

            {/* Inspection Question Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                What would you like evaluated in this photo?
              </label>
              <textarea
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="e.g. Does this scaffold tie-in setup appear to meet OSHA 1926.451 requirements?"
                rows={2}
                disabled={isUploading || isAnalyzing}
                className="w-full resize-none bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50 transition-colors"
              />

              {/* Starter chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PHOTO_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setPhotoInput(q)}
                    className="text-[10px] px-2.5 py-1 rounded bg-surface-subtle border border-surface-border text-slate-400 hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={submitPhotoAnalysis}
                disabled={!selectedFile || !photoInput.trim() || isUploading || isAnalyzing}
                className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading photo securely…
                  </>
                ) : isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running Vision AI reasoning…
                  </>
                ) : (
                  <>
                    <span>🔍</span> Analyze Photo Compliance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Stream */}
          {photoResults.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Photo Compliance Inspections ({photoResults.length})
              </h4>

              {photoResults.map((res) => (
                <div
                  key={res.queryId}
                  className="p-5 rounded-xl bg-surface-card border border-surface-border space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Question: &quot;{res.question}&quot;</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Storage: {res.storagePath} · {new Date(res.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => savePhotoAnswer(res)}
                      disabled={savedPhotoQueryIds.has(res.queryId)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        savedPhotoQueryIds.has(res.queryId)
                          ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 cursor-default'
                          : 'text-slate-300 hover:text-white bg-surface-elevated border border-surface-border'
                      }`}
                    >
                      {savedPhotoQueryIds.has(res.queryId) ? (
                        <span>✓ Saved to Workspace</span>
                      ) : (
                        <>
                          <span>⬇</span> Save to Workspace
                        </>
                      )}
                    </button>
                  </div>

                  {/* Answer Body */}
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {res.answer}
                  </div>

                  {/* Cited Standards */}
                  {res.citedStandards.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-border">
                      {res.citedStandards.map((std) => (
                        <span
                          key={std}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950/50 border border-brand-800/40 text-brand-300"
                        >
                          {std}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mandatory Legal Notice Adjacent to Answer */}
                  <div className="px-3.5 py-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[10px] text-amber-200/70 leading-relaxed">
                    <strong className="text-amber-200/90 font-mono">Compliance Notice: </strong>
                    {COMPLIANCE_DISCLAIMER}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Toast Notification */}
      <div className="absolute bottom-20 right-4 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg border transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                : 'bg-red-950 border-red-800 text-red-300'
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
