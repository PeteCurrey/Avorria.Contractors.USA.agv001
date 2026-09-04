/**
 * AVORRIA DISCOVER — DYNAMIC CLOSING DATE ENGINE
 *
 * Evaluates real-time closing date status without guessing or inference:
 *   - CLOSED: Target/closing date is in the past, or opportunity status is closed/cancelled.
 *   - CLOSING_TODAY: Closing date matches the current calendar day.
 *   - CLOSING_SOON: Closing within a 7-day window.
 *   - OPEN: Closing date exists and is > 7 days in the future, or open with flexible date.
 *   - NO_CLOSING_DATE: No deadline recorded in the source data.
 *
 * Maintains clean separation between source dates (closing date) and platform timestamps.
 */

import { ClosingDateStatus, DynamicClosingDateInfo } from './types';

/**
 * Normalizes an ISO or YYYY-MM-DD string to a Date set to midnight UTC for date-only comparison.
 */
function toUtcMidnight(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Returns today at midnight UTC for deterministic delta calculations.
 */
function getTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Formats a date string into human-readable standard format: e.g. "15 Sep 2026"
 */
export function formatClosingDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Computes dynamic closing date state and relative time context.
 *
 * @param dateStr Optional target/closing date string
 * @param lifecycleStatus Optional opportunity status (e.g. 'closed', 'cancelled', 'open')
 * @param referenceDate Optional reference Date for hermetic unit testing
 */
export function computeClosingDateState(
  dateStr?: string | null,
  lifecycleStatus?: string,
  referenceDate?: Date
): DynamicClosingDateInfo {
  // If lifecycle is explicitly closed or cancelled, status is closed regardless of date
  const isExplicitlyClosed = lifecycleStatus === 'closed' || lifecycleStatus === 'cancelled';

  if (!dateStr) {
    return {
      status: isExplicitlyClosed ? 'CLOSED' : 'NO_CLOSING_DATE',
      daysRemaining: null,
      relativeText: isExplicitlyClosed ? 'Opportunity closed' : 'No closing date recorded',
      isExpiringSoon: false,
      formattedClosingDate: null,
    };
  }

  const target = toUtcMidnight(dateStr);
  if (!target) {
    return {
      status: isExplicitlyClosed ? 'CLOSED' : 'NO_CLOSING_DATE',
      daysRemaining: null,
      relativeText: isExplicitlyClosed ? 'Opportunity closed' : 'No closing date recorded',
      isExpiringSoon: false,
      formattedClosingDate: null,
    };
  }

  const now = referenceDate ? new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate())) : getTodayUtc();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round((target.getTime() - now.getTime()) / msPerDay);
  const formattedClosingDate = formatClosingDate(dateStr);

  if (isExplicitlyClosed || daysRemaining < 0) {
    const daysPast = Math.abs(daysRemaining);
    return {
      status: 'CLOSED',
      daysRemaining,
      relativeText: daysRemaining < 0
        ? daysPast === 1
          ? 'Closed yesterday'
          : `Closed ${daysPast} days ago`
        : 'Opportunity closed',
      isExpiringSoon: false,
      formattedClosingDate,
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'CLOSING_TODAY',
      daysRemaining: 0,
      relativeText: 'Closing today',
      isExpiringSoon: true,
      formattedClosingDate,
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'CLOSING_SOON',
      daysRemaining,
      relativeText: daysRemaining === 1 ? 'Closes in 1 day' : `Closes in ${daysRemaining} days`,
      isExpiringSoon: true,
      formattedClosingDate,
    };
  }

  return {
    status: 'OPEN',
    daysRemaining,
    relativeText: `Closes in ${daysRemaining} days`,
    isExpiringSoon: false,
    formattedClosingDate,
  };
}
