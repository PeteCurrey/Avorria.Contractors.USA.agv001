/**
 * AVORRIA REDIRECT ENGINE
 * 
 * Supports:
 * - 301 / 308 Permanent redirects & 302 / 307 Temporary redirects
 * - Normalized path comparison (case normalization, trailing slash consistency)
 * - Chain flattening (A -> B -> C directly resolves to C in a single hop)
 * - Loop / cycle prevention (detects A -> B -> A and terminates safely)
 * - Extensible database / CMS lookup with in-memory fast path
 */

export interface RedirectRule {
  sourcePath: string;
  targetPath: string;
  statusCode: 301 | 302 | 307 | 308;
  isActive: boolean;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedirectResult {
  shouldRedirect: boolean;
  targetUrl: string;
  statusCode: number;
  chainLength: number;
  originalPath: string;
}

/**
 * Normalizes an incoming pathname for predictable comparison.
 * Trims spaces, enforces lowercase, and removes trailing slash (except root '/').
 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  
  // Remove query params or hash if accidentally included in path
  let clean = path.split('?')[0].split('#')[0].trim().toLowerCase();
  
  // Ensure leading slash
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }
  
  // Remove trailing slash
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  
  return clean;
}

/**
 * In-memory fallback and seed redirects (e.g. legacy migrations, URL changes).
 */
export const INITIAL_REDIRECT_RULES: RedirectRule[] = [
  {
    sourcePath: '/rams',
    targetPath: '/templates/job-hazard-analysis-jha',
    statusCode: 301,
    isActive: true,
    reason: 'US Terminology Migration: RAMS -> JHA',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    sourcePath: '/templates/rams',
    targetPath: '/templates/job-hazard-analysis-jha',
    statusCode: 301,
    isActive: true,
    reason: 'US Terminology Migration: templates/rams -> templates/job-hazard-analysis-jha',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    sourcePath: '/contractor-passport-verification',
    targetPath: '/contractor-verification',
    statusCode: 301,
    isActive: true,
    reason: 'Route consolidation',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    sourcePath: '/tools/quote-calculator',
    targetPath: '/tools/contractor-quote-calculator',
    statusCode: 301,
    isActive: true,
    reason: 'SEO keyword optimization',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

/**
 * Resolves redirects with chain flattening and loop detection.
 */
export function resolveRedirect(
  inputPath: string,
  rules: RedirectRule[] = INITIAL_REDIRECT_RULES
): RedirectResult | null {
  const normalizedStart = normalizePath(inputPath);
  
  // Build lookup map of active rules
  const ruleMap = new Map<string, RedirectRule>();
  for (const rule of rules) {
    if (rule.isActive) {
      ruleMap.set(normalizePath(rule.sourcePath), rule);
    }
  }

  if (!ruleMap.has(normalizedStart)) {
    return null;
  }

  const visited = new Set<string>();
  let currentPath = normalizedStart;
  let finalStatusCode: number = 301;
  let chainLength = 0;
  const MAX_CHAIN_DEPTH = 5;

  while (ruleMap.has(currentPath)) {
    if (visited.has(currentPath)) {
      // Loop detected! Abort to prevent infinite redirect loop
      console.warn(`[RedirectEngine] Loop detected for path: ${currentPath}`);
      return null;
    }

    if (chainLength >= MAX_CHAIN_DEPTH) {
      console.warn(`[RedirectEngine] Maximum redirect depth exceeded for: ${normalizedStart}`);
      break;
    }

    visited.add(currentPath);
    const matchedRule = ruleMap.get(currentPath)!;
    finalStatusCode = matchedRule.statusCode;
    currentPath = normalizePath(matchedRule.targetPath);
    chainLength++;
  }

  // If target is identical to input, do not redirect
  if (currentPath === normalizedStart) {
    return null;
  }

  return {
    shouldRedirect: true,
    targetUrl: currentPath,
    statusCode: finalStatusCode,
    chainLength,
    originalPath: normalizedStart,
  };
}
