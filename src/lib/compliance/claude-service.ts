/**
 * AVORRIA — CLAUDE COMPLIANCE REASONING SERVICE
 *
 * Routes every Ask Avorria question to Claude (Anthropic) with a tightly
 * constrained system prompt that:
 *
 *   1. Injects the contractor's trade, state, and license context from
 *      their Passport/profile — never re-asks the user.
 *   2. Requires every factual claim to be cited inline from OSHA 1926/1910
 *      or the stated state's licensing/insurance rules.
 *   3. Mandates an explicit refusal response rather than guessing for
 *      any state-specific detail the model cannot reliably verify.
 *   4. Prohibits language that reads as legal advice, an OSHA determination,
 *      a certification, or a guarantee of compliance.
 *   5. Prohibits bare compliance verdicts ("this is compliant") — every
 *      conclusion must be framed relative to the cited standard.
 *
 * Model selection:
 *   Primary text model: claude-3-5-sonnet-20241022
 *   (Update COMPLIANCE_MODEL constant when a newer stable model is confirmed.)
 *
 * If ANTHROPIC_API_KEY is not set, the service throws ClaudeServiceError
 * with code 'NO_API_KEY'. The API route converts this to a 503 — no fake
 * fallback data is ever returned.
 */

import Anthropic from '@anthropic-ai/sdk';

// ─── Model Configuration ─────────────────────────────────────────────────────

/**
 * The model used for all compliance Q&A answers.
 * Update this constant when confirming a newer stable model at build time.
 */
export const COMPLIANCE_MODEL = 'claude-3-5-sonnet-20241022';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContractorContext {
  tradeContext: string;   // e.g. "Electrical Contracting"
  stateContext: string;   // e.g. "TX"
  stateName: string;      // e.g. "Texas"
  licenseType: string;    // e.g. "Electrical Contractor License (TDLR)"
}

export interface ComplianceAnswer {
  content: string;
  citedStandards: string[];
  modelUsed: string;
  provider: 'anthropic';
}

export class ClaudeServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'NO_API_KEY' | 'API_ERROR' | 'RATE_LIMITED'
  ) {
    super(message);
    this.name = 'ClaudeServiceError';
  }
}

// ─── State name map ───────────────────────────────────────────────────────────

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

export function resolveStateName(stateCode: string): string {
  return STATE_NAMES[stateCode.toUpperCase()] ?? stateCode;
}

// ─── License type inference (when not stored in onboarding data) ─────────────

/**
 * Maps trade slugs to likely license categories. Used only as a human-readable
 * label in the system prompt — the model is still required to cite the actual
 * statute rather than rely on this label.
 */
function inferLicenseLabel(tradeSlug: string, stateCode: string): string {
  const trade = tradeSlug.toLowerCase();
  const state = stateCode.toUpperCase();

  if (/electric/.test(trade)) {
    if (state === 'TX') return 'Electrical Contractor License (TDLR)';
    if (state === 'CA') return 'Electrical Contractor License (CSLB)';
    if (state === 'FL') return 'Certified or Registered Electrical Contractor (DBPR)';
    return 'State Electrical Contractor License';
  }
  if (/plumb/.test(trade)) {
    if (state === 'TX') return 'Master Plumber License (TSBPE)';
    if (state === 'CA') return 'Plumbing Contractor License (CSLB C-36)';
    return 'State Master Plumber / Plumbing Contractor License';
  }
  if (/hvac|mechanical/.test(trade)) {
    return 'HVAC / Mechanical Contractor License';
  }
  if (/general/.test(trade)) {
    if (state === 'CA') return 'General Building Contractor License (CSLB B)';
    if (state === 'TX') return 'Residential / Commercial Contractor Registration (TRCC)';
    return 'General Contractor License';
  }
  if (/roofing/.test(trade)) return 'Roofing Contractor License';
  if (/concrete|structural|masonry/.test(trade)) return 'Structural / Masonry Contractor License';

  return 'Contractor License (trade-specific)';
}

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(ctx: ContractorContext): string {
  return `You are Avorria's compliance guidance assistant for contractors. You provide factual, citable guidance on federal OSHA regulations (29 CFR Part 1926 for construction and 29 CFR Part 1910 for general industry) and state-specific contractor licensing and insurance requirements.

CONTRACTOR CONTEXT (automatically resolved from their profile — do not re-ask):
- Primary Trade: ${ctx.tradeContext}
- Operating State: ${ctx.stateName} (${ctx.stateContext})
- License Category: ${ctx.licenseType}

━━━ MANDATORY RULES — FOLLOW WITHOUT EXCEPTION ━━━

1. CITE ALL STANDARDS INLINE
   Every factual claim must reference its source directly in the response text.
   Acceptable examples: "under OSHA 1926.501(b)(1)...", "per 29 CFR 1910.147(c)(4)...", "under ${ctx.stateName} [Agency] [Statute or Rule]..."
   Do not make regulatory assertions without a verifiable citation. If you cannot cite a specific standard, do not make the assertion.

2. ADMIT UNCERTAINTY — NEVER GUESS
   If you do not have reliable, current, verified knowledge of a specific state's license classes, bond amounts, municipal ordinances, or regulatory thresholds, you MUST respond with:
   "I don't have a confident answer for this — consult your [specific state agency name] or a licensed contractor attorney in ${ctx.stateName}."
   Fabricated or plausible-sounding regulatory specifics are strictly prohibited. A clear refusal is always better than an inaccurate answer.

3. NEVER CLAIM LEGAL AUTHORITY
   Do not state or imply that your answer constitutes:
   - Legal advice
   - An official OSHA determination
   - A formal compliance certification or audit finding
   - A guarantee of regulatory compliance or job-site safety
   Your role is to help contractors identify the relevant rules. A licensed attorney, compliance professional, or state authority makes formal determinations.

4. NO BARE COMPLIANCE VERDICTS
   Never output language like "this is compliant", "you are compliant", or "this meets OSHA standards" as a standalone conclusion. Every conclusion must be framed as:
   "based on [cited standard], the requirement is..." or "under [regulation], a contractor in this situation would typically need to..."
   so the contractor understands they must verify against their specific conditions.

5. SCOPE DISCIPLINE
   Prioritize guidance relevant to the contractor's trade (${ctx.tradeContext}) and state (${ctx.stateName}). If the question falls outside OSHA 1926/1910 and the contractor's state licensing/insurance rules, say so clearly and direct them to the appropriate authority.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMATIONAL NOTICE — ALWAYS INCLUDE BELOW YOUR ANSWER:
Your response is informational guidance only based on federal OSHA regulations and generally known jurisdictional requirements. It is not legal advice, an official OSHA determination, a regulatory certification, or a guarantee of compliance. Verify requirements with your state licensing authority and qualified legal counsel before making compliance decisions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ─── Cited-standards extractor ────────────────────────────────────────────────

/**
 * Extracts standard identifiers from the model's response for logging and
 * display in the UI. This is purely additive — the full text of the response
 * is always stored as-is; this just makes citations queryable.
 */
export function extractCitedStandards(content: string): string[] {
  const patterns = [
    // OSHA 1926.501(b)(1) / OSHA 1910.147
    /OSHA\s+\d{4}\.\d+(?:\([a-z0-9]+\))*/gi,
    // 29 CFR 1926.502 / 29 CFR 1910.147(c)
    /29\s+CFR\s+(?:Part\s+)?\d{4}(?:\.\d+(?:\([a-z0-9]+\))*)?/gi,
    // Bare 1926.501 / 1910.147 references
    /\b(?:1926|1910)\.\d+(?:\([a-z0-9]+\))*/g,
    // NFPA 70E, NFPA 101, ANSI Z359, etc.
    /(?:NFPA|ANSI|ASTM|IBC|IFC)\s+[A-Z0-9]+(?:\.\d+)?/gi,
  ];

  const found = new Set<string>();
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      found.add(match[0].trim().replace(/\s+/g, ' '));
    }
  }

  return Array.from(found);
}

// ─── Main service function ────────────────────────────────────────────────────

/**
 * Ask Claude a compliance question with full contractor context injected.
 *
 * @throws ClaudeServiceError when API key is missing or the API call fails.
 */
export async function askComplianceQuestion(
  question: string,
  ctx: ContractorContext
): Promise<ComplianceAnswer> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ClaudeServiceError(
      'Anthropic API key is not configured. Set ANTHROPIC_API_KEY in your environment.',
      'NO_API_KEY'
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: COMPLIANCE_MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(ctx),
      messages: [{ role: 'user', content: question }],
    });
  } catch (err: unknown) {
    if (err instanceof Anthropic.APIError) {
      if (err.status === 429) {
        throw new ClaudeServiceError(
          'Anthropic API rate limit reached. Please try again shortly.',
          'RATE_LIMITED'
        );
      }
      throw new ClaudeServiceError(
        `Anthropic API error (${err.status}): ${err.message}`,
        'API_ERROR'
      );
    }
    throw new ClaudeServiceError(
      `Unexpected error calling Anthropic API: ${String(err)}`,
      'API_ERROR'
    );
  }

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new ClaudeServiceError('Anthropic returned no text content.', 'API_ERROR');
  }

  const content = textBlock.text;
  const citedStandards = extractCitedStandards(content);

  return {
    content,
    citedStandards,
    modelUsed: COMPLIANCE_MODEL,
    provider: 'anthropic',
  };
}

/**
 * Build contractor context from workspace data for the system prompt.
 * Falls back gracefully if fields are missing — never fabricates values.
 */
export function buildContractorContext(params: {
  trades: string[];
  primaryState: string;
  onboardingData?: Record<string, unknown>;
}): ContractorContext {
  const primaryTrade = params.trades[0] ?? 'general-contracting';
  const stateCode = (params.primaryState ?? 'US').toUpperCase();

  // Try to pull license type from onboarding data first
  const onboarding = params.onboardingData ?? {};
  const storedLicenseType =
    (onboarding.licenseType as string | undefined) ??
    (onboarding.license_type as string | undefined) ??
    (onboarding.primaryLicenseType as string | undefined);

  const licenseType =
    storedLicenseType ?? inferLicenseLabel(primaryTrade, stateCode);

  // Format trade slug into readable label
  const tradeContext = primaryTrade
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    tradeContext,
    stateContext: stateCode,
    stateName: resolveStateName(stateCode),
    licenseType,
  };
}
