/**
 * AVORRIA EMAIL TEMPLATE BUILDER
 *
 * Produces inline-CSS HTML emails for Resend.
 * Specific credential names and dates always appear in subject lines and body.
 * Urgency tiers drive visual treatment (info=neutral, warning=amber, critical=red).
 */

import { NotificationUrgency } from '../workspace/types';

export interface RenewalEmailParams {
  recipientName: string;
  orgName: string;
  credentialLabel: string;     // e.g. "General Liability COI (#GL-2024-1182)"
  expirationDateFormatted: string; // e.g. "October 14, 2026"
  daysRemaining: number;       // negative = already expired
  urgency: NotificationUrgency;
  actionUrl: string;           // deep-link to specific credential
}

export interface DigestEmailParams {
  recipientName: string;
  orgName: string;
  items: Array<{
    credentialLabel: string;
    expirationDateFormatted: string;
    daysRemaining: number;
    urgency: NotificationUrgency;
    actionUrl: string;
  }>;
}

// ── Colour tokens per urgency ──────────────────────────────────────────────

const URGENCY_PALETTE = {
  info: {
    headerBg: '#1E293B',
    accentBg: '#F0F9FF',
    accentBorder: '#BAE6FD',
    accentText: '#0369A1',
    ctaBg: '#0EA5E9',
    ctaText: '#FFFFFF',
    badge: '#0EA5E9',
    badgeText: '#FFFFFF',
    badgeLabel: 'COMPLIANCE ALERT',
  },
  warning: {
    headerBg: '#1E293B',
    accentBg: '#FFFBEB',
    accentBorder: '#FCD34D',
    accentText: '#92400E',
    ctaBg: '#F59E0B',
    ctaText: '#000000',
    badge: '#F59E0B',
    badgeText: '#000000',
    badgeLabel: '⚠ WARNING',
  },
  critical: {
    headerBg: '#1E293B',
    accentBg: '#FEF2F2',
    accentBorder: '#FECACA',
    accentText: '#991B1B',
    ctaBg: '#EF4444',
    ctaText: '#FFFFFF',
    badge: '#EF4444',
    badgeText: '#FFFFFF',
    badgeLabel: '🔴 URGENT ACTION REQUIRED',
  },
};

// ── Subject line builder ────────────────────────────────────────────────────

export function buildRenewalSubject(params: RenewalEmailParams): string {
  const { credentialLabel, daysRemaining, orgName, urgency } = params;

  if (daysRemaining <= 0) {
    return `🚨 EXPIRED: ${credentialLabel} — ${orgName}`;
  }
  if (urgency === 'critical') {
    return `🔴 URGENT: ${credentialLabel} expires in ${daysRemaining} days — ${orgName}`;
  }
  if (urgency === 'warning') {
    return `⚠ ${credentialLabel} expires in ${daysRemaining} days — ${orgName}`;
  }
  return `${credentialLabel} expires in ${daysRemaining} days — ${orgName}`;
}

// ── Renewal email HTML ──────────────────────────────────────────────────────

export function buildRenewalEmailHtml(params: RenewalEmailParams): string {
  const {
    recipientName,
    orgName,
    credentialLabel,
    expirationDateFormatted,
    daysRemaining,
    urgency,
    actionUrl,
  } = params;

  const p = URGENCY_PALETTE[urgency];
  const isExpired = daysRemaining <= 0;

  const statusLine = isExpired
    ? `<strong style="color:${p.accentText}">This credential is now expired.</strong>`
    : `Expires in <strong style="color:${p.accentText}">${daysRemaining} days</strong> on <strong>${expirationDateFormatted}</strong>.`;

  const ctaLabel = isExpired ? 'Upload Renewed Certificate →' : 'View Credential in Avorria →';
  const bodyMessage = isExpired
    ? `Your credential has expired. Upload a renewed certificate immediately to maintain compliance status and avoid losing your Verified Contractor badge.`
    : urgency === 'critical'
    ? `This is your final advance warning. If this credential is not renewed before ${expirationDateFormatted}, your compliance status and Verified Contractor badge will be affected.`
    : urgency === 'warning'
    ? `Upload your renewed certificate now to keep ${orgName}'s compliance status current before the deadline.`
    : `You have time to renew. Log in to upload an updated certificate or license so you're not scrambling at the deadline.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isExpired ? 'Credential Expired' : 'Credential Expiry Alert'}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${p.headerBg};border-radius:12px 12px 0 0;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">Avorria</span>
                  <span style="font-size:11px;color:#94A3B8;margin-left:8px;font-family:monospace;letter-spacing:0.08em;">CONTRACTORS USA</span>
                </td>
                <td align="right">
                  <span style="display:inline-block;background:${p.badge};color:${p.badgeText};font-size:10px;font-weight:700;font-family:monospace;letter-spacing:0.1em;padding:4px 10px;border-radius:4px;">
                    ${p.badgeLabel}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#FFFFFF;padding:32px;">

            <p style="margin:0 0 8px;font-size:14px;color:#64748B;">
              Hello ${recipientName},
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              This is a compliance alert for <strong>${orgName}</strong>.
            </p>

            <!-- Credential box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${p.accentBg};border:1px solid ${p.accentBorder};border-radius:8px;padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:10px;font-family:monospace;letter-spacing:0.1em;color:#94A3B8;text-transform:uppercase;">Credential</p>
                  <p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#0F172A;">${credentialLabel}</p>
                  <p style="margin:0;font-size:14px;color:#475569;">${statusLine}</p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0;font-size:14px;color:#475569;line-height:1.6;">
              ${bodyMessage}
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:${p.ctaBg};">
                  <a href="${actionUrl}"
                    style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:${p.ctaText};text-decoration:none;border-radius:8px;font-family:monospace;letter-spacing:0.03em;">
                    ${ctaLabel}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:32px 0 0;font-size:12px;color:#94A3B8;line-height:1.6;border-top:1px solid #E2E8F0;padding-top:20px;">
              This alert was sent because your account is set to receive compliance expiry notifications.
              You can adjust your notification preferences in your
              <a href="https://avorria.com/workspace/settings?tab=notifications" style="color:#0EA5E9;text-decoration:none;">Avorria workspace settings</a>.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F1F5F9;border-radius:0 0 12px 12px;padding:16px 32px;">
            <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">
              Avorria Contractors USA &nbsp;·&nbsp; compliance@avorria.com &nbsp;·&nbsp;
              <a href="https://avorria.com" style="color:#94A3B8;">avorria.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Digest email HTML ──────────────────────────────────────────────────────

export function buildDigestEmailHtml(params: DigestEmailParams): string {
  const { recipientName, orgName, items } = params;

  const criticalCount = items.filter((i) => i.urgency === 'critical').length;
  const expiredCount = items.filter((i) => i.daysRemaining <= 0).length;

  const subjectSummary = expiredCount > 0
    ? `${expiredCount} expired + ${items.length - expiredCount} expiring`
    : `${items.length} credential${items.length > 1 ? 's' : ''} expiring soon`;

  const rows = items
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .map((item) => {
      const p = URGENCY_PALETTE[item.urgency];
      const statusText = item.daysRemaining <= 0
        ? 'EXPIRED'
        : `${item.daysRemaining} days`;
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;font-weight:600;">
            ${item.credentialLabel}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#475569;">
            ${item.expirationDateFormatted}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center;">
            <span style="display:inline-block;background:${p.badge};color:${p.badgeText};font-size:10px;font-weight:700;font-family:monospace;padding:3px 8px;border-radius:3px;">
              ${statusText}
            </span>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:right;">
            <a href="${item.actionUrl}" style="font-size:12px;color:#0EA5E9;font-weight:600;text-decoration:none;">View →</a>
          </td>
        </tr>`;
    }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Compliance Digest — ${orgName}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">
        <tr>
          <td style="background:#1E293B;border-radius:12px 12px 0 0;padding:28px 32px;">
            <span style="font-size:18px;font-weight:700;color:#FFFFFF;">Avorria</span>
            <span style="font-size:11px;color:#94A3B8;margin-left:8px;font-family:monospace;">COMPLIANCE DIGEST</span>
          </td>
        </tr>
        <tr>
          <td style="background:#FFFFFF;padding:32px;">
            <p style="margin:0 0 8px;font-size:14px;color:#64748B;">Hello ${recipientName},</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              Your compliance digest for <strong>${orgName}</strong>: ${subjectSummary}.
              ${criticalCount > 0 ? `<strong style="color:#EF4444">${criticalCount} require immediate attention.</strong>` : ''}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#F8FAFC;">
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-family:monospace;letter-spacing:0.1em;color:#94A3B8;text-transform:uppercase;border-bottom:1px solid #E2E8F0;">Credential</th>
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-family:monospace;letter-spacing:0.1em;color:#94A3B8;text-transform:uppercase;border-bottom:1px solid #E2E8F0;">Expires</th>
                  <th style="padding:10px 16px;text-align:center;font-size:10px;font-family:monospace;letter-spacing:0.1em;color:#94A3B8;text-transform:uppercase;border-bottom:1px solid #E2E8F0;">Status</th>
                  <th style="padding:10px 16px;border-bottom:1px solid #E2E8F0;"></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="margin:32px 0 0;font-size:12px;color:#94A3B8;line-height:1.6;border-top:1px solid #E2E8F0;padding-top:20px;">
              You're receiving this digest because your notification preferences are set to ${items[0] ? 'digest' : 'immediate'} mode.
              <a href="https://avorria.com/workspace/settings?tab=notifications" style="color:#0EA5E9;">Change preferences</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F1F5F9;border-radius:0 0 12px 12px;padding:16px 32px;">
            <p style="margin:0;font-size:11px;color:#94A3B8;text-align:center;">
              Avorria Contractors USA &nbsp;·&nbsp; compliance@avorria.com
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildDigestSubject(params: DigestEmailParams): string {
  const { orgName, items } = params;
  const expiredCount = items.filter((i) => i.daysRemaining <= 0).length;
  if (expiredCount > 0) {
    return `🚨 ${expiredCount} expired credential${expiredCount > 1 ? 's' : ''} — Compliance Digest for ${orgName}`;
  }
  return `Compliance Digest: ${items.length} expiring credential${items.length > 1 ? 's' : ''} — ${orgName}`;
}
