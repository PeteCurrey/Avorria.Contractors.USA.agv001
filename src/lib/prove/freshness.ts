/**
 * AVORRIA PROVE — DYNAMIC FRESHNESS & RUNTIME TIMESTAMPS
 *
 * Strict constraint: Never hard-code dates or relative durations.
 * All outputs derive strictly from (stored ISO timestamp + runtime new Date()).
 */

/**
 * Computes human-readable relative freshness from an ISO timestamp.
 */
export function getRelativeFreshness(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Evidence date not recorded';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Evidence date not recorded';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 0) {
    return 'Recorded just now';
  }
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes <= 1) return 'Updated just now';
      return `Updated ${diffMinutes}m ago`;
    }
    return `Updated today (${diffHours}h ago)`;
  }
  if (diffDays === 1) {
    return 'Updated yesterday';
  }
  if (diffDays < 7) {
    return `Updated ${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Updated ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Last updated ${months} month${months > 1 ? 's' : ''} ago (${diffDays}d)`;
  }
  const years = Math.floor(diffDays / 365);
  return `Last updated ${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Categorizes evidence freshness into structured tiers.
 */
export function getFreshnessTier(
  timestamp: string | null | undefined
): 'fresh' | 'moderate' | 'aged' | 'unrecorded' {
  if (!timestamp) return 'unrecorded';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'unrecorded';

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return 'fresh';
  if (diffDays <= 90) return 'moderate';
  return 'aged';
}

/**
 * Formats a verifiable ISO date string into a clear technical timestamp.
 */
export function formatVerificationTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Unrecorded';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Unrecorded';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats Date-only source fields (YYYY-MM-DD) deterministically
 * without timezone drift converting calendar dates (Section 51).
 */
export function formatSourceDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Date not recorded';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const month = months[monthIndex] || match[2];
  return `${day} ${month} ${year}`;
}

/**
 * Formats an expiry date with dynamic runtime days remaining context (Section 48).
 * Never hardcoded. All relative days computed dynamically from new Date().
 */
export function formatExpiryWithContext(expiryDateStr: string | null | undefined): string {
  if (!expiryDateStr) return 'No expiry date recorded';
  const formatted = formatSourceDate(expiryDateStr);
  const match = expiryDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return formatted;

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expUtc = Date.UTC(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  const diffDays = Math.ceil((expUtc - todayUtc) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return `${formatted} · Expired ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
  }
  if (diffDays === 0) {
    return `${formatted} · Expires today`;
  }
  return `${formatted} · ${diffDays} day${diffDays === 1 ? '' : 's'} remaining`;
}

/**
 * Formats platform creation/modification timestamps.
 */
export function formatPlatformTimestamp(isoStr: string | null | undefined): string {
  if (!isoStr) return 'Date not recorded';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return 'Date not recorded';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
