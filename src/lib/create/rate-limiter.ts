/**
 * AVORRIA PUBLIC GENERATION RATE LIMITER
 *
 * Enforces a strict cap of 3 document generations per session/IP for unauthenticated
 * public tools (JHA Generator, Quote Calculator, etc.) before requiring sign-up.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_PUBLIC_GENERATIONS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour sliding window

/**
 * Extracts a robust client identifier from request headers or cookies.
 */
export function getClientIdentifier(req: Request): string {
  // 1. Explicit session header from client
  const sessionHeader = req.headers.get('x-session-id');
  if (sessionHeader && sessionHeader.trim().length > 0) {
    return `session:${sessionHeader.trim()}`;
  }

  // 2. Cookie-based session ID
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/avorria_public_session=([^;]+)/);
  if (match && match[1]) {
    return `cookie:${match[1].trim()}`;
  }

  // 3. IP address fallback
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp) return `ip:${clientIp}`;
  }

  const realIp = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip');
  if (realIp) {
    return `ip:${realIp.trim()}`;
  }

  return 'ip:unknown-client';
}

export interface RateLimitStatus {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Checks and increments the generation count for a client.
 * If increment is false, only reads current state without consuming an attempt.
 */
export function checkPublicRateLimit(
  identifier: string,
  increment = true
): RateLimitStatus {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    const newRecord: RateLimitRecord = {
      count: increment ? 1 : 0,
      resetAt: now + WINDOW_MS,
    };
    if (increment) {
      rateLimitStore.set(identifier, newRecord);
    }
    return {
      allowed: true,
      count: newRecord.count,
      remaining: MAX_PUBLIC_GENERATIONS - newRecord.count,
      resetAt: newRecord.resetAt,
      limit: MAX_PUBLIC_GENERATIONS,
    };
  }

  if (existing.count >= MAX_PUBLIC_GENERATIONS) {
    return {
      allowed: false,
      count: existing.count,
      remaining: 0,
      resetAt: existing.resetAt,
      limit: MAX_PUBLIC_GENERATIONS,
    };
  }

  if (increment) {
    existing.count += 1;
    rateLimitStore.set(identifier, existing);
  }

  return {
    allowed: true,
    count: existing.count,
    remaining: MAX_PUBLIC_GENERATIONS - existing.count,
    resetAt: existing.resetAt,
    limit: MAX_PUBLIC_GENERATIONS,
  };
}

/**
 * Helper to clear rate limit store (for automated testing).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
