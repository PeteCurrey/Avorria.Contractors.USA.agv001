/**
 * AVORRIA RENEWAL ALERTS & NOTIFICATIONS SERVICE
 *
 * Automated credential status monitoring with escalating urgency tiers.
 * - 60-day: informational — email to org owners only, urgency=info
 * - 30-day: warning — email to all admins + owners, urgency=warning
 * - 14-day: critical — email to ALL admins + owners, urgency=critical
 * - Expired: critical — email to ALL admins + owners, urgency=critical
 *
 * Subject lines always name the specific credential and org.
 * Digest mode: if user preference is daily/weekly, items are queued not sent immediately.
 */

import { Resend } from 'resend';
import {
  NotificationType,
  NotificationUrgency,
  WorkspaceNotification,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from './types';
import {
  listNotifications as dbListNotifications,
  saveNotification,
  markNotificationRead,
  getUserByOrg,
  loadWorkspaceStore,
} from './db';
import { listCredentials } from './credentials';
import {
  buildRenewalEmailHtml,
  buildRenewalSubject,
  RenewalEmailParams,
} from '../notifications/email-templates';
import { queueForDigest, runDigestSend } from '../notifications/digest';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'placeholder-resend-key') return null;
  return new Resend(apiKey);
}

export async function listNotifications(
  orgId: string,
  userId?: string
): Promise<WorkspaceNotification[]> {
  return dbListNotifications(orgId, userId);
}

export async function markAsRead(id: string): Promise<boolean> {
  return markNotificationRead(id);
}

export interface RenewalAlertRunResult {
  evaluatedCredentials: number;
  alertsSent: number;
  emailsDelivered: number;
  emailsQueued: number;
}

// ── Threshold → urgency mapping ─────────────────────────────────────────────

function resolveThreshold(diffDays: number): {
  type: NotificationType;
  urgency: NotificationUrgency;
  daysLabel: string;
  recipientFilter: 'owners_only' | 'all_admin_owner';
} | null {
  if (diffDays <= 0) {
    return { type: 'expired', urgency: 'critical', daysLabel: 'has expired', recipientFilter: 'all_admin_owner' };
  }
  if (diffDays <= 14) {
    return { type: 'expiring_14', urgency: 'critical', daysLabel: `expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`, recipientFilter: 'all_admin_owner' };
  }
  if (diffDays <= 30) {
    return { type: 'expiring_30', urgency: 'warning', daysLabel: `expires in ${diffDays} days`, recipientFilter: 'all_admin_owner' };
  }
  if (diffDays <= 60) {
    return { type: 'expiring_60', urgency: 'info', daysLabel: `expires in ${diffDays} days`, recipientFilter: 'owners_only' };
  }
  return null;
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatCredentialLabel(cred: { type: string; policy_or_license_number?: string }): string {
  const typeLabel = cred.type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return cred.policy_or_license_number
    ? `${typeLabel} (#${cred.policy_or_license_number})`
    : typeLabel;
}

function formatDateFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

// ── Main alert runner ─────────────────────────────────────────────────────────

export async function runRenewalAlertCheck(): Promise<RenewalAlertRunResult> {
  const store = loadWorkspaceStore();
  const orgIds = Object.keys(store.organizations);
  const resend = getResendClient();

  let evaluated = 0;
  let alertsSent = 0;
  let emailsDelivered = 0;
  let emailsQueued = 0;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (const orgId of orgIds) {
    const org = store.organizations[orgId];
    const credentials = await listCredentials(orgId);
    const allUsers = await getUserByOrg(orgId);

    for (const cred of credentials) {
      evaluated++;
      if (!cred.expiration_date) continue;

      const expDate = new Date(cred.expiration_date);
      if (isNaN(expDate.getTime())) continue;

      const expDay = new Date(Date.UTC(expDate.getUTCFullYear(), expDate.getUTCMonth(), expDate.getUTCDate()));
      const diffDays = Math.ceil((expDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const threshold = resolveThreshold(diffDays);
      if (!threshold) continue;

      // Deduplication: skip if this type of alert was already saved today for this credential
      const existingToday = Object.values(store.notifications).some(
        (n) =>
          n.org_id === orgId &&
          n.related_credential_id === cred.id &&
          n.type === threshold.type &&
          new Date(n.sent_at).toDateString() === now.toDateString()
      );
      if (existingToday) continue;

      // Determine recipients
      const recipients = allUsers.filter((u) => {
        if (threshold.recipientFilter === 'owners_only') return u.role === 'owner' && u.email;
        return (u.role === 'owner' || u.role === 'admin') && u.email;
      });

      const credLabel = formatCredentialLabel(cred);
      const expFormatted = formatDateFull(cred.expiration_date);
      const actionUrl = `https://avorria.com/workspace/comply?credential=${cred.id}`;
      const message = `${credLabel} ${threshold.daysLabel} (${expFormatted})`;

      for (const recipient of recipients) {
        // Save in-app notification
        const prefs = recipient.notification_preferences ?? DEFAULT_NOTIFICATION_PREFERENCES;
        const notifId = `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (prefs.expiry_alerts_inapp) {
          await saveNotification({
            id: notifId,
            org_id: orgId,
            user_id: recipient.id,
            type: threshold.type,
            urgency: threshold.urgency,
            related_credential_id: cred.id,
            related_entity_type: 'credential',
            action_url: actionUrl,
            sent_at: new Date().toISOString(),
            message,
          });
          alertsSent++;
        }

        // Email delivery
        if (!prefs.expiry_alerts_email || !recipient.email) continue;

        const emailParams: RenewalEmailParams = {
          recipientName: recipient.full_name,
          orgName: org.name,
          credentialLabel: credLabel,
          expirationDateFormatted: expFormatted,
          daysRemaining: diffDays,
          urgency: threshold.urgency,
          actionUrl,
        };

        if (prefs.digest_mode !== 'immediate') {
          // Queue for digest instead
          queueForDigest({
            orgId,
            orgName: org.name,
            userId: recipient.id,
            userEmail: recipient.email,
            userName: recipient.full_name,
            credentialId: cred.id,
            credentialLabel: credLabel,
            expirationDateFormatted: expFormatted,
            daysRemaining: diffDays,
            urgency: threshold.urgency,
            actionUrl,
            queuedAt: new Date().toISOString(),
          });
          emailsQueued++;
        } else if (resend) {
          // Send immediately
          try {
            await resend.emails.send({
              from: 'Avorria Compliance <compliance@avorria.com>',
              to: recipient.email,
              subject: buildRenewalSubject(emailParams),
              html: buildRenewalEmailHtml(emailParams),
              // Plain-text fallback for accessibility + spam scoring
              text: `${recipient.full_name},\n\nCompliance alert for ${org.name}:\n${credLabel} ${threshold.daysLabel}.\nExpiration date: ${expFormatted}\n\nTake action now: ${actionUrl}\n\nAvorria Contractors USA`,
            });
            emailsDelivered++;
          } catch (e) {
            console.error(`Failed to send renewal email to ${recipient.email}:`, e);
          }
        }
      }
    }
  }

  return { evaluatedCredentials: evaluated, alertsSent, emailsDelivered, emailsQueued };
}

// Re-export digest runner so it can be triggered from a separate cron endpoint
export { runDigestSend };
