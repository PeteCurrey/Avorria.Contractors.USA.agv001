/**
 * AVORRIA RENEWAL ALERTS & NOTIFICATIONS SERVICE
 *
 * Automated status monitoring and Resend email alerts at 60/30/14-day
 * thresholds and expiration day for org owners and admins.
 */

import { Resend } from 'resend';
import {
  NotificationType,
  WorkspaceNotification,
} from './types';
import {
  listNotifications as dbListNotifications,
  saveNotification,
  markNotificationRead,
  getUserByOrg,
  loadWorkspaceStore,
} from './db';
import { listCredentials } from './credentials';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'placeholder-resend-key') {
    return null;
  }
  return new Resend(apiKey);
}

export async function listNotifications(orgId: string, userId?: string): Promise<WorkspaceNotification[]> {
  return dbListNotifications(orgId, userId);
}

export async function markAsRead(id: string): Promise<boolean> {
  return markNotificationRead(id);
}

export interface RenewalAlertRunResult {
  evaluatedCredentials: number;
  alertsSent: number;
  emailsDelivered: number;
}

/**
 * Evaluates all credentials across organizations and dispatches alerts at 60/30/14-day
 * thresholds and on expiration day.
 */
export async function runRenewalAlertCheck(): Promise<RenewalAlertRunResult> {
  const store = loadWorkspaceStore();
  const orgIds = Object.keys(store.organizations);
  const resend = getResendClient();

  let evaluated = 0;
  let alertsSent = 0;
  let emailsDelivered = 0;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  for (const orgId of orgIds) {
    const org = store.organizations[orgId];
    const credentials = await listCredentials(orgId);
    const users = await getUserByOrg(orgId);
    const recipients = users.filter((u) => (u.role === 'owner' || u.role === 'admin') && u.email);

    for (const cred of credentials) {
      evaluated++;
      if (!cred.expiration_date) continue;

      const expDate = new Date(cred.expiration_date);
      if (isNaN(expDate.getTime())) continue;

      const expDay = new Date(Date.UTC(expDate.getUTCFullYear(), expDate.getUTCMonth(), expDate.getUTCDate()));
      const diffMs = expDay.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let targetType: NotificationType | null = null;
      let thresholdLabel = '';

      if (diffDays <= 0) {
        targetType = 'expired';
        thresholdLabel = 'has expired';
      } else if (diffDays <= 14) {
        targetType = 'expiring_14';
        thresholdLabel = `expires in ${diffDays} days (14-day threshold)`;
      } else if (diffDays <= 30) {
        targetType = 'expiring_30';
        thresholdLabel = `expires in ${diffDays} days (30-day threshold)`;
      } else if (diffDays <= 60) {
        targetType = 'expiring_60';
        thresholdLabel = `expires in ${diffDays} days (60-day threshold)`;
      }

      if (!targetType) continue;

      // Deduplication check: check if an alert of this type was already sent today for this credential
      const existingNotifs = Object.values(store.notifications).filter(
        (n) =>
          n.org_id === orgId &&
          n.related_credential_id === cred.id &&
          n.type === targetType &&
          new Date(n.sent_at).toDateString() === now.toDateString()
      );

      if (existingNotifs.length > 0) {
        continue;
      }

      const credTitle = `${cred.type.replace(/_/g, ' ').toUpperCase()}${
        cred.policy_or_license_number ? ` (#${cred.policy_or_license_number})` : ''
      }`;
      const message = `Credential Alert: Your ${credTitle} ${thresholdLabel}.`;

      for (const recipient of recipients) {
        await saveNotification({
          id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          org_id: orgId,
          user_id: recipient.id,
          type: targetType,
          related_credential_id: cred.id,
          sent_at: new Date().toISOString(),
          message,
        });
        alertsSent++;

        // Send email via Resend
        if (resend && recipient.email) {
          try {
            await resend.emails.send({
              from: 'Avorria Compliance <compliance@avorria.com>',
              to: recipient.email,
              subject: `Action Required: Credential ${thresholdLabel} - ${org.name}`,
              text: `Hello ${recipient.full_name},\n\nThis is an automated compliance alert for ${org.name}.\n\nYour credential "${credTitle}" ${thresholdLabel}.\nExpiration Date: ${cred.expiration_date}\n\nPlease log in to your Avorria workspace to upload an updated certificate or license.\n\nhttps://avorria.com/workspace/comply\n\nAvorria Contractors USA`,
            });
            emailsDelivered++;
          } catch (e) {
            console.error(`Failed to send renewal email to ${recipient.email}:`, e);
          }
        }
      }
    }
  }

  return {
    evaluatedCredentials: evaluated,
    alertsSent,
    emailsDelivered,
  };
}
