/**
 * AVORRIA — FIREBASE / FIRESTORE TYPES
 *
 * Shared TypeScript definitions for the Ask Avorria and Photo Compliance
 * Assistant features. Collections:
 *
 *   askAvorriaThreads/{threadId}                        — one thread per conversation
 *   askAvorriaThreads/{threadId}/messages/{messageId}   — individual turns
 *   askAvorriaAnalytics/{analyticsId}                   — PII-sanitized Q log (Lobby feed)
 *   workspaceSavedItems/{itemId}                        — shared save target (text + photo)
 *   photoComplianceQueries/{queryId}                    — photo analysis records (Prompt 2)
 */

export interface AskAvorriaThread {
  id: string;
  userId: string;
  tradeContext: string;
  stateContext: string;
  createdAt: string;
  lastMessageAt: string;
}

export interface AskAvorriaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed: string;
  citedStandards: string[];
  createdAt: string;
}

export interface AskAvorriaAnalyticsRecord {
  id: string;
  /** User question with PII stripped — feeds The Lobby content pipeline. */
  question: string;
  tradeContext: string;
  stateContext: string;
  timestamp: string;
}

/**
 * Shared save target for both Ask Avorria (type: ask_avorria_answer)
 * and Photo Compliance (type: photo_compliance_answer).
 * Schema is designed to be dashboard-ready — no dashboard UI is built yet.
 */
export interface WorkspaceSavedItem {
  id: string;
  userId: string;
  type: 'ask_avorria_answer' | 'photo_compliance_answer';
  question: string;
  answer: string;
  citedStandards: string[];
  tradeContext: string;
  stateContext: string;
  modelUsed: string;
  sourceThreadId: string;
  /** Populated for photo_compliance_answer; absent for ask_avorria_answer. */
  storagePath?: string;
  createdAt: string;
}

/**
 * Firestore record written for every photo compliance analysis.
 * Prompt 2 populates this — schema is defined here so Prompt 1 doesn't
 * need to re-invent it.
 */
export interface PhotoComplianceQuery {
  id: string;
  userId: string;
  storagePath: string;
  question: string;
  tradeContext: string;
  stateContext: string;
  modelUsed: string;
  answer: string;
  citedStandards: string[];
  createdAt: string;
}
