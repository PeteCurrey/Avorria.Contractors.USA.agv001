/**
 * AVORRIA CONTRACTOR PASSPORT (PROVE MODULE) SERVICE
 *
 * Handles live passport compilation, request-time credential evaluation,
 * bcrypt password protection, access tracking with SHA-256 IP hashing,
 * and view notifications.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  Passport,
  Credential,
  WorkspaceDocument,
  ReadinessScoreBreakdown,
  Organization,
} from './types';
import {
  getPassportByOrg as dbGetPassportByOrg,
  getPassportBySlug as dbGetPassportBySlug,
  savePassport as dbSavePassport,
  recordPassportAccess,
  listPassportAccessLogs,
  getOrganization,
  saveNotification,
  getUserByOrg,
} from './db';
import { listCredentials } from './credentials';
import { listDocuments } from './db';
import { calculateReadinessScore } from './readiness';

export interface SavePassportInput {
  slug: string;
  is_password_protected?: boolean;
  password?: string; // Cleartext from user input — hashed immediately
  included_credential_ids?: string[];
  included_document_ids?: string[];
}

export interface PublicPassportView {
  slug: string;
  organization: {
    name: string;
    legal_name?: string;
    primary_trade: string;
    additional_trades: string[];
    states_licensed: string[];
    logo_url?: string;
  };
  isPasswordProtected: boolean;
  isPasswordUnlocked?: boolean;
  readinessScore: number;
  readinessBreakdown: ReadinessScoreBreakdown;
  credentials: Credential[];
  documents: WorkspaceDocument[];
  viewCount: number;
  lastViewedAt?: string;
}

export async function getPassportByOrg(orgId: string): Promise<Passport | null> {
  return dbGetPassportByOrg(orgId);
}

export async function savePassport(
  orgId: string,
  input: SavePassportInput
): Promise<Passport> {
  const existing = await dbGetPassportByOrg(orgId);

  // Validate slug uniqueness
  const bySlug = await dbGetPassportBySlug(input.slug);
  if (bySlug && bySlug.org_id !== orgId) {
    throw new Error(`The passport URL segment "${input.slug}" is already taken.`);
  }

  let passwordHash = existing?.password_hash;
  if (input.is_password_protected) {
    if (input.password && input.password.trim().length > 0) {
      // Hash with bcrypt — zero plaintext storage
      const salt = bcrypt.genSaltSync(10);
      passwordHash = bcrypt.hashSync(input.password, salt);
    } else if (!passwordHash) {
      throw new Error('A password is required when password protection is enabled.');
    }
  } else {
    passwordHash = undefined;
  }

  const passport: Passport = {
    id: existing?.id || `psp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    org_id: orgId,
    slug: input.slug.toLowerCase().trim(),
    is_password_protected: Boolean(input.is_password_protected),
    password_hash: passwordHash,
    included_credential_ids: input.included_credential_ids || existing?.included_credential_ids || [],
    included_document_ids: input.included_document_ids || existing?.included_document_ids || [],
    view_count: existing?.view_count || 0,
    last_viewed_at: existing?.last_viewed_at,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const saved = await dbSavePassport(passport);
  await calculateReadinessScore(orgId);
  return saved;
}

/**
 * Verifies a password attempt against the bcrypt password hash.
 */
export async function verifyPassportPassword(slug: string, passwordAttempt: string): Promise<boolean> {
  const passport = await dbGetPassportBySlug(slug);
  if (!passport || !passport.is_password_protected || !passport.password_hash) {
    return true; // Not protected
  }
  return bcrypt.compareSync(passwordAttempt, passport.password_hash);
}

/**
 * Loads the public passport with LIVE credentials and status badges pulled at request time.
 * An expired credential renders as expired immediately even if passport link is old.
 */
export async function getPublicPassport(
  slug: string,
  clientIp: string,
  referrer?: string,
  providedPassword?: string
): Promise<PublicPassportView | null> {
  const passport = await dbGetPassportBySlug(slug);
  if (!passport) return null;

  const org = await getOrganization(passport.org_id);
  if (!org) return null;

  // Verify password protection if enabled
  let isPasswordUnlocked = true;
  if (passport.is_password_protected) {
    if (!providedPassword || !passport.password_hash) {
      isPasswordUnlocked = false;
    } else {
      isPasswordUnlocked = bcrypt.compareSync(providedPassword, passport.password_hash);
    }
  }

  // Hash IP using SHA-256 (no raw IP storage)
  const viewerIpHash = crypto.createHash('sha256').update(clientIp || 'unknown').digest('hex');

  // Log view event and update count
  await recordPassportAccess({
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    passport_id: passport.id,
    viewed_at: new Date().toISOString(),
    viewer_ip_hash: viewerIpHash,
    referrer,
  });

  // Notify org members of passport view
  const orgUsers = await getUserByOrg(passport.org_id);
  for (const user of orgUsers) {
    if (user.role === 'owner' || user.role === 'admin') {
      await saveNotification({
        id: `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        org_id: passport.org_id,
        user_id: user.id,
        type: 'passport_viewed',
        sent_at: new Date().toISOString(),
        message: `Someone viewed your Contractor Passport (${passport.slug}).`,
      });
    }
  }

  // Compute live readiness score
  const readinessLog = await calculateReadinessScore(passport.org_id);

  // Pull live credentials & filter to included IDs
  const allCredentials = await listCredentials(passport.org_id);
  const includedCredentials = allCredentials.filter((c) =>
    passport.included_credential_ids.includes(c.id)
  );

  // Pull live documents & filter to included IDs
  const allDocuments = await listDocuments(passport.org_id);
  const includedDocuments = allDocuments.filter((d) =>
    passport.included_document_ids.includes(d.id)
  );

  return {
    slug: passport.slug,
    organization: {
      name: org.name,
      legal_name: org.legal_name,
      primary_trade: org.primary_trade,
      additional_trades: org.additional_trades,
      states_licensed: org.states_licensed,
      logo_url: org.logo_url,
    },
    isPasswordProtected: passport.is_password_protected,
    isPasswordUnlocked,
    readinessScore: readinessLog.score,
    readinessBreakdown: readinessLog.breakdown,
    credentials: isPasswordUnlocked ? includedCredentials : [],
    documents: isPasswordUnlocked ? includedDocuments : [],
    viewCount: (passport.view_count || 0) + 1,
    lastViewedAt: new Date().toISOString(),
  };
}
