/**
 * AVORRIA CONTRACTOR PASSPORT ENGINE
 * 
 * Implements deterministic completion calculation and publication eligibility evaluation.
 */

import {
  PassportCompletionResult,
  PassportCompletionItem,
  PublicationEligibilityResult,
} from './types';
import { ContractorWorkspaceData } from '@/lib/tenant/repository';
import { EvaluatedRequirement } from '@/lib/compliance/engine';

/**
 * Computes deterministic Passport completion percentage and actionable missing items.
 * Does NOT conflate completion with legal compliance or safety verification.
 */
export function computePassportCompletion(
  ws: ContractorWorkspaceData,
  requirements: EvaluatedRequirement[]
): PassportCompletionResult {
  const items: PassportCompletionItem[] = [
    // 1. Business Identity
    {
      id: 'item_business_name',
      category: 'business_identity',
      label: 'Business & Trade Name',
      description: 'Official operating name and structure provided.',
      weight: 15,
      satisfied: Boolean(ws.organisation.name && ws.organisation.name.trim().length > 2),
      actionUrl: '/app/business',
      actionLabel: 'Update Business Identity',
    },
    {
      id: 'item_contact_info',
      category: 'business_identity',
      label: 'Direct Business Contact',
      description: 'Active operating phone or email on file.',
      weight: 10,
      satisfied: Boolean(ws.organisation.phone || ws.organisation.email),
      actionUrl: '/app/business',
      actionLabel: 'Add Contact Details',
    },
    {
      id: 'item_company_description',
      category: 'business_identity',
      label: 'Company Overview / Description',
      description: 'Public bio explaining contractor capabilities and history.',
      weight: 10,
      satisfied: Boolean(ws.profile.business_description && ws.profile.business_description.length > 20),
      actionUrl: '/app/business',
      actionLabel: 'Write Overview',
    },

    // 2. Trades & Service Territory
    {
      id: 'item_trade_defined',
      category: 'trades_service',
      label: 'Core Trade Classification',
      description: 'At least one primary trade taxonomy classification selected.',
      weight: 15,
      satisfied: ws.trades.length > 0,
      actionUrl: '/app/business',
      actionLabel: 'Configure Trades',
    },
    {
      id: 'item_service_territory',
      category: 'trades_service',
      label: 'Operating Territory & State',
      description: 'Primary operating state and regional service area defined.',
      weight: 10,
      satisfied: Boolean(ws.serviceAreas.primaryState && ws.serviceAreas.cities.length > 0),
      actionUrl: '/app/business',
      actionLabel: 'Define Service Area',
    },

    // 3. Credentials & Insurance Evidence
    {
      id: 'item_insurance_evidence',
      category: 'credentials',
      label: 'Commercial General Liability Policy',
      description: 'Active Certificate of Insurance (COI) uploaded to Document Vault.',
      weight: 15,
      satisfied: ws.documents.some(
        (d) => (d.document_type.includes('insurance') || d.document_type.includes('coi')) && d.status === 'active'
      ),
      actionUrl: '/app/documents',
      actionLabel: 'Upload Insurance COI',
    },
    {
      id: 'item_trade_licensing',
      category: 'credentials',
      label: 'Trade Contractor License',
      description: 'Active state or municipal trade license record uploaded.',
      weight: 10,
      satisfied: ws.documents.some((d) => d.document_type.includes('license')) || ws.baselineCredentials.hasTradeLicense,
      actionUrl: '/app/documents',
      actionLabel: 'Add Trade License',
    },

    // 4. Safety & Operational Programs
    {
      id: 'item_safety_plan',
      category: 'safety_operations',
      label: 'Written Safety Program / JHA Process',
      description: 'Documented site-specific safety plan or Job Hazard Analysis.',
      weight: 15,
      satisfied: ws.documents.some(
        (d) => d.document_type.includes('safety') || d.document_type.includes('jha')
      ) || (ws.generatedDocuments && ws.generatedDocuments.some((g) => g.document_status === 'final')),
      actionUrl: '/app/documents/create/jha',
      actionLabel: 'Create Safety JHA',
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = items
    .filter((item) => item.satisfied)
    .reduce((sum, item) => sum + item.weight, 0);

  const completionPercentage = Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
  const missingItems = items.filter((item) => !item.satisfied);

  // Category breakdown
  const categories = [
    { category: 'business_identity', label: 'Business Identity' },
    { category: 'trades_service', label: 'Trades & Coverage' },
    { category: 'credentials', label: 'Insurance & Licenses' },
    { category: 'safety_operations', label: 'Safety Programs' },
  ];

  const categoryBreakdown = categories.map((cat) => {
    const catItems = items.filter((i) => i.category === cat.category);
    const catTotal = catItems.reduce((acc, curr) => acc + curr.weight, 0);
    const catEarned = catItems.filter((i) => i.satisfied).reduce((acc, curr) => acc + curr.weight, 0);
    return {
      category: cat.category,
      label: cat.label,
      percentage: catTotal > 0 ? Math.round((catEarned / catTotal) * 100) : 100,
    };
  });

  return {
    completionPercentage,
    isComplete: completionPercentage >= 90,
    items,
    missingItems,
    categoryBreakdown,
  };
}

/**
 * Separate publication eligibility engine.
 * Does NOT universally require licenses or insurance if not applicable to the contractor context.
 */
export function evaluatePublicationEligibility(
  ws: ContractorWorkspaceData
): PublicationEligibilityResult {
  const blockers: string[] = [];
  const recommendations: string[] = [];
  const reasons: string[] = [];

  // Mandatory Publication Gates:
  if (!ws.organisation.name || ws.organisation.name.trim().length < 2) {
    blockers.push('Business name must be set.');
  } else {
    reasons.push('Business identity is established.');
  }

  if (ws.trades.length === 0) {
    blockers.push('At least one trade classification must be selected.');
  } else {
    reasons.push('Active trade classification confirmed.');
  }

  if (!ws.serviceAreas.primaryState) {
    blockers.push('Primary operating state must be specified.');
  } else {
    reasons.push('Service area operating state established.');
  }

  if (ws.profile.onboarding_status !== 'completed') {
    blockers.push('Contractor onboarding must be completed.');
  }

  // Non-blocking recommendations
  const hasCoi = ws.documents.some((d) => d.document_type.includes('insurance') || d.document_type.includes('coi'));
  if (!hasCoi) {
    recommendations.push('Upload a Certificate of Insurance (COI) to show verified insurance protection to prospective clients.');
  }

  const hasSafety = ws.documents.some((d) => d.document_type.includes('safety') || d.document_type.includes('jha'));
  if (!hasSafety) {
    recommendations.push('Generate a site safety JHA to demonstrate OSHA compliance readiness.');
  }

  return {
    eligible: blockers.length === 0,
    reasons,
    blockers,
    recommendations,
  };
}
