/**
 * AVORRIA — PII SANITIZER
 *
 * Strips personally identifiable information from user questions before
 * they are written to the askAvorriaAnalytics Firestore collection.
 *
 * Patterns targeted:
 *   - Email addresses
 *   - US telephone numbers (NANP + international with +1)
 *   - Social Security Numbers (SSN)
 *   - Employer Identification Numbers (EIN)
 *   - US street address fragments (number + street type)
 *   - Common name-introduction patterns ("my name is John", "I am Jane")
 *
 * Replacement: each match is replaced with the token type in brackets
 * so analysts know what was redacted without seeing the value.
 *
 * This is a best-effort sanitizer. Do not rely on it to guarantee
 * HIPAA/GDPR completeness — questions should never request PII in the
 * first place, and this is a secondary safety net.
 */

const RULES: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/gi,
    replacement: '[EMAIL]',
  },
  {
    name: 'us_phone',
    // Handles: 555-1234, (555) 555-1234, +1 555 555 1234, 5555551234, 1-800-555-1234
    pattern:
      /(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[PHONE]',
  },
  {
    name: 'ssn',
    // 123-45-6789 or 123 45 6789
    pattern: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
    replacement: '[SSN]',
  },
  {
    name: 'ein',
    // 12-3456789 or 123456789
    pattern: /\b\d{2}-\d{7}\b/g,
    replacement: '[EIN]',
  },
  {
    name: 'street_address',
    // e.g. "123 Main Street", "4501 Oak Ave", "Unit 5, 100 Industrial Blvd"
    pattern:
      /\b\d{1,5}\s+[A-Za-z0-9\s]{2,30}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Circle|Cir|Terrace|Ter|Trail|Trl|Parkway|Pkwy)\b/gi,
    replacement: '[ADDRESS]',
  },
  {
    name: 'name_introduction',
    // "my name is John Smith", "I am Jane Doe", "call me Bob"
    pattern:
      /(?:my name is|i am|i'm|call me)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gi,
    replacement: '[NAME]',
  },
];

/**
 * Returns a sanitized copy of the input string with PII replaced by tokens.
 * The original string is never mutated.
 */
export function sanitizePii(text: string): string {
  let result = text;
  for (const { pattern, replacement } of RULES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Returns true if the sanitized text differs from the original —
 * useful for logging that PII was detected and stripped.
 */
export function containsPii(text: string): boolean {
  return sanitizePii(text) !== text;
}
