'use client';

/**
 * AVORRIA — ASK AVORRIA COMPLIANCE WIDGET
 *
 * Chat-style interface for the Ask Avorria compliance Q&A feature.
 * Accessible from the Compliance workspace under the "COMPLIANCE & WORKFORCE"
 * navigation section.
 *
 * Design rules (per spec):
 *  - Disclaimer renders directly under every assistant message — not once at
 *    the top of the thread.
 *  - Save to Workspace is off by default; each assistant message has an
 *    independent save button that fires a POST to /api/compliance/save.
 *  - Confirmation is a transient toast — no modal.
 *  - Trade + state context badges are shown in the header (auto-resolved,
 *    never re-asked in the chat UI).
 *  - Loading state is shown during the Claude call (these can take 2–5s).
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

// ─── Compliance disclaimer (rendered adjacent to every assistant message) ─────

const COMPLIANCE_DISCLAIMER =
  'Informational guidance only — grounded in federal OSHA 1926/1910 and jurisdictional licensing rules. Not legal advice, an official OSHA determination, a compliance certification, or a guarantee of regulatory compliance.';

// ─── Quick-start prompts ──────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  'What fall protection is required when working at 6 feet on a construction site?',
  'Do I need a separate license for residential and commercial electrical work in my state?',
  'What are the OSHA requirements for scaffold tie-ins on buildings over 26 feet?',
  'When is a site-specific safety plan required vs. a standard HASP?',
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AskAvorriaWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [contextError, setContextError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Focus input on load ────────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Toast auto-dismiss (3 s) ───────────────────────────────────────────────
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const showToast = useCallback((text: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  // ── Send question ──────────────────────────────────────────────────────────
  const sendQuestion = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isLoading) return;

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
      setInput('');
      setIsLoading(true);
      setContextError(null);

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
          setContextError(errorText);
          // Remove the optimistic user message on failure
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          return;
        }

        // Capture context from first response
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
        setContextError('Network error. Please check your connection and try again.');
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, threadId, context]
  );

  // ── Handle enter key (shift+enter for newline) ─────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion(input);
      }
    },
    [input, sendQuestion]
  );

  // ── Save answer to workspace ───────────────────────────────────────────────
  const saveAnswer = useCallback(
    async (msg: ChatMessage) => {
      if (!msg.messageId || savedMessageIds.has(msg.messageId)) return;

      // Find the preceding user message as the question
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
          showToast('Saved to workspace ✓');
        } else {
          showToast('Failed to save — please try again.', 'error');
        }
      } catch {
        showToast('Network error saving answer.', 'error');
      }
    },
    [messages, context, threadId, savedMessageIds, showToast]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col border border-surface-border rounded-xl bg-surface-card overflow-hidden h-[700px] relative">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-border bg-surface-subtle flex items-center justify-between shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Ask Avorria</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-900/40 text-brand-400 border border-brand-800/40">
              COMPLIANCE Q&amp;A
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            OSHA 1926/1910 &amp; state licensing — answers cite the rule they draw from
          </p>
        </div>

        {/* Context badges — auto-resolved from profile */}
        {context && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-1 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono">
              {context.tradeContext}
            </span>
            <span className="px-2 py-1 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono">
              {context.stateName} ({context.stateContext})
            </span>
          </div>
        )}
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && !isLoading && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">
              Ask a compliance or licensing question. Your trade and state context are
              loaded from your profile automatically.
            </p>
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-slate-600 uppercase">Quick starts</p>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuestion(prompt)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-lg border border-surface-border bg-surface-subtle text-slate-400 hover:text-white hover:border-brand-700 hover:bg-brand-950/20 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-brand-700 text-white text-sm leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] space-y-2.5">
                {/* Answer bubble */}
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated border border-surface-border">
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {/* Cited standards pills */}
                  {msg.citedStandards.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-border">
                      {msg.citedStandards.map((std) => (
                        <span
                          key={std}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-950/40 border border-brand-800/30 text-brand-400"
                        >
                          {std}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Disclaimer — adjacent to every assistant message per spec */}
                <div className="px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[10px] text-amber-200/60 leading-relaxed">
                  <strong className="text-amber-200/80">Compliance Notice: </strong>
                  {COMPLIANCE_DISCLAIMER}
                </div>

                {/* Save action */}
                {msg.messageId && (
                  <div className="flex items-center gap-2 pl-1">
                    <button
                      type="button"
                      onClick={() => saveAnswer(msg)}
                      disabled={savedMessageIds.has(msg.messageId!)}
                      title={
                        savedMessageIds.has(msg.messageId!)
                          ? 'Saved to workspace'
                          : 'Save to workspace'
                      }
                      className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded transition-colors ${
                        savedMessageIds.has(msg.messageId!)
                          ? 'text-emerald-500 cursor-default'
                          : 'text-slate-500 hover:text-white hover:bg-surface-elevated border border-transparent hover:border-surface-border'
                      }`}
                    >
                      {savedMessageIds.has(msg.messageId!) ? (
                        <>✓ Saved</>
                      ) : (
                        <>
                          <span>⬇</span> Save to workspace
                        </>
                      )}
                    </button>
                    {msg.modelUsed && (
                      <span className="text-[10px] font-mono text-slate-600">
                        via {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated border border-surface-border">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                Reviewing federal OSHA standards and jurisdictional rules…
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {contextError && (
          <div className="px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300">
            {contextError}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-surface-border bg-surface-subtle shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a compliance or licensing question…"
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600 disabled:opacity-50 transition-colors leading-relaxed"
          />
          <button
            type="button"
            onClick={() => sendQuestion(input)}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            Ask
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 pl-0.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* Toast stack */}
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
