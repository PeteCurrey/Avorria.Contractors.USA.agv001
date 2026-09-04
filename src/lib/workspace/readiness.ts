/**
 * AVORRIA SERVER-SIDE READINESS SCORE ENGINE
 *
 * Recomputes the contractor's readiness score on any credential or document change.
 * Exact parity with the calculate_readiness_score Postgres function in Migration 00011.
 * Never computed client-side as the source of truth.
 */

import {
  ReadinessScoreBreakdown,
  ReadinessScoreLog,
} from './types';
import {
  listCredentials,
  listDocuments,
  listToolboxTalks,
  getPassportByOrg,
  saveReadinessScoreLog,
} from './db';

export async function calculateReadinessScore(orgId: string): Promise<ReadinessScoreLog> {
  const credentials = await listCredentials(orgId);
  const documents = await listDocuments(orgId);
  const toolboxTalks = await listToolboxTalks(orgId);
  const passport = await getPassportByOrg(orgId);

  let insuranceScore = 0;
  let licensingScore = 0;
  let documentsScore = 0;
  let passportScore = 0;

  // 1. Insurance: GL COI (20 pts active, 10 pts expiring)
  const glCurrent = credentials.some(
    (c) => c.type === 'general_liability_coi' && c.status === 'current'
  );
  const glExpiring = credentials.some(
    (c) =>
      c.type === 'general_liability_coi' &&
      ['expiring_60', 'expiring_30', 'expiring_14'].includes(c.status)
  );

  if (glCurrent) {
    insuranceScore += 20;
  } else if (glExpiring) {
    insuranceScore += 10;
  }

  // Insurance: Workers' Comp (15 pts active, 8 pts expiring)
  const wcCurrent = credentials.some(
    (c) => c.type === 'workers_comp' && c.status === 'current'
  );
  const wcExpiring = credentials.some(
    (c) =>
      c.type === 'workers_comp' &&
      ['expiring_60', 'expiring_30', 'expiring_14'].includes(c.status)
  );

  if (wcCurrent) {
    insuranceScore += 15;
  } else if (wcExpiring) {
    insuranceScore += 8;
  }

  // 2. Licensing: Trade License (25 pts active, 12 pts expiring)
  const licenseCurrent = credentials.some(
    (c) => c.type === 'trade_license' && c.status === 'current'
  );
  const licenseExpiring = credentials.some(
    (c) =>
      c.type === 'trade_license' &&
      ['expiring_60', 'expiring_30', 'expiring_14'].includes(c.status)
  );

  if (licenseCurrent) {
    licensingScore = 25;
  } else if (licenseExpiring) {
    licensingScore = 12;
  }

  // 3. Documents: Safety Plan / JHA (15 pts)
  const hasSafetyPlan = documents.some((d) =>
    ['safety_plan', 'jha', 'jsa'].includes(d.type)
  );
  if (hasSafetyPlan) {
    documentsScore += 15;
  }

  // Toolbox Talk within 30 days (10 pts)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const hasRecentToolbox = toolboxTalks.some((t) => {
    const talkDate = new Date(t.date);
    return talkDate >= thirtyDaysAgo;
  });
  if (hasRecentToolbox) {
    documentsScore += 10;
  }

  // 4. Passport Completeness (15 pts): published passport with at least 1 included credential
  const hasPassport = Boolean(
    passport && passport.included_credential_ids && passport.included_credential_ids.length > 0
  );
  if (hasPassport) {
    passportScore = 15;
  }

  const rawTotal = insuranceScore + licensingScore + documentsScore + passportScore;
  const score = Math.min(100, Math.max(0, rawTotal));

  const breakdown: ReadinessScoreBreakdown = {
    credential_completeness: insuranceScore + licensingScore,
    insurance_score: insuranceScore,
    insurance_max: 35,
    licensing_score: licensingScore,
    licensing_max: 25,
    document_currency: documentsScore,
    documents_score: documentsScore,
    documents_max: 25,
    passport_completeness: passportScore,
    passport_score: passportScore,
    passport_max: 15,
    has_gl_coi: glCurrent || glExpiring,
    has_workers_comp: wcCurrent || wcExpiring,
    has_trade_license: licenseCurrent || licenseExpiring,
    has_safety_plan: hasSafetyPlan,
    has_recent_toolbox_talk: hasRecentToolbox,
    has_passport: hasPassport,
  };

  const log: ReadinessScoreLog = {
    id: `rlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    org_id: orgId,
    score,
    calculated_at: new Date().toISOString(),
    breakdown,
  };

  await saveReadinessScoreLog(log);
  return log;
}
