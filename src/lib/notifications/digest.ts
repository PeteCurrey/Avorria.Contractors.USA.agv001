/**
 * AVORRIA DIGEST QUEUE
 *
 * For users who prefer daily/weekly digest emails instead of per-item alerts,
 * renewal items are queued here and drained by runDigestSend().
 */

import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { NotificationUrgency } from '../workspace/types';
import { buildDigestEmailHtml, buildDigestSubject, DigestEmailParams } from './email-templates';

export interface DigestQueueItem {
  orgId: string;
  orgName: string;
  userId: string;
  userEmail: string;
  userName: string;
  credentialId: string;
  credentialLabel: string;
  expirationDateFormatted: string;
  daysRemaining: number;
  urgency: NotificationUrgency;
  actionUrl: string;
  queuedAt: string;
}

interface DigestStore {
  items: DigestQueueItem[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DIGEST_PATH = path.join(DATA_DIR, 'digest-queue.json');

let memoryDigest: DigestStore = { items: [] };

function loadDigestStore(): DigestStore {
  try {
    if (fs.existsSync(DIGEST_PATH)) {
      const raw = fs.readFileSync(DIGEST_PATH, 'utf-8');
      memoryDigest = JSON.parse(raw);
      return memoryDigest;
    }
  } catch {
    // Fall back to in-memory
  }
  return memoryDigest;
}

function saveDigestStore(store: DigestStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DIGEST_PATH, JSON.stringify(store, null, 2), 'utf-8');
    memoryDigest = store;
  } catch {
    memoryDigest = store;
  }
}

export function queueForDigest(item: DigestQueueItem): void {
  const store = loadDigestStore();
  // Deduplicate: skip if same org+user+credential already queued today
  const today = new Date().toDateString();
  const alreadyQueued = store.items.some(
    (q) =>
      q.orgId === item.orgId &&
      q.userId === item.userId &&
      q.credentialId === item.credentialId &&
      new Date(q.queuedAt).toDateString() === today
  );
  if (!alreadyQueued) {
    store.items.push(item);
    saveDigestStore(store);
  }
}

export function getQueuedItems(): DigestQueueItem[] {
  return loadDigestStore().items;
}

export function clearQueuedItems(itemIds: string[]): void {
  const store = loadDigestStore();
  // We identify by credentialId+userId+orgId+date combo; or just drain all
  if (itemIds.length === 0) {
    store.items = [];
  } else {
    store.items = store.items.filter((i) => !itemIds.includes(i.credentialId + ':' + i.userId));
  }
  saveDigestStore(store);
}

/**
 * Groups queued items by org+user, sends one digest email per user, then drains the queue.
 */
export async function runDigestSend(resend: Resend): Promise<{ sent: number; failed: number }> {
  const store = loadDigestStore();
  if (store.items.length === 0) return { sent: 0, failed: 0 };

  // Group by userId (and orgId as secondary key)
  const grouped = new Map<string, DigestQueueItem[]>();
  for (const item of store.items) {
    const key = `${item.orgId}:${item.userId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  let sent = 0;
  let failed = 0;

  for (const [, items] of grouped) {
    const first = items[0];
    const digestParams: DigestEmailParams = {
      recipientName: first.userName,
      orgName: first.orgName,
      items: items.map((i) => ({
        credentialLabel: i.credentialLabel,
        expirationDateFormatted: i.expirationDateFormatted,
        daysRemaining: i.daysRemaining,
        urgency: i.urgency,
        actionUrl: i.actionUrl,
      })),
    };

    try {
      await resend.emails.send({
        from: 'Avorria Compliance <compliance@avorria.com>',
        to: first.userEmail,
        subject: buildDigestSubject(digestParams),
        html: buildDigestEmailHtml(digestParams),
      });
      sent++;
    } catch (err) {
      console.error(`Digest send failed for ${first.userEmail}:`, err);
      failed++;
    }
  }

  // Drain sent items
  saveDigestStore({ items: [] });
  return { sent, failed };
}
