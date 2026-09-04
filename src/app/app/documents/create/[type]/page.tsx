'use client';

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { getDocumentDefinition } from '@/lib/documents/registry';
import { DocumentTypeSlug } from '@/lib/documents/types';
import { UniversalCreatePage } from '@/components/documents/UniversalCreatePage';

// Custom fields are injected per document type to supplement the universal project block
const CUSTOM_FIELDS_MAP: Record<string, Array<{
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  helperText?: string;
}>> = {
  jha: [
    { key: 'taskSequence', label: 'Primary Task / Work Activity', type: 'text', placeholder: 'e.g. Install electrical panel in commercial building' },
    { key: 'tradeScope', label: 'Trade / Scope', type: 'text', placeholder: 'e.g. Electrical – Tenant Fit-Out' },
    { key: 'crewSize', label: 'Estimated Crew Size', type: 'number', placeholder: '4' },
  ],
  jsa: [
    { key: 'specificActivity', label: 'Specific Work Activity', type: 'text', placeholder: 'e.g. Roof framing – truss installation' },
    { key: 'tradeScope', label: 'Trade / Scope', type: 'text', placeholder: 'e.g. Framing – Residential New Build' },
    { key: 'crewSize', label: 'Crew Size', type: 'number', placeholder: '3' },
  ],
  'safety-plan': [
    { key: 'projectDuration', label: 'Estimated Project Duration', type: 'text', placeholder: 'e.g. 6 weeks', helperText: 'For safety plan scope' },
    { key: 'supervisorName', label: 'Site Safety Supervisor', type: 'text', placeholder: 'Full name' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'text', placeholder: '(555) 000-0000' },
  ],
  'toolbox-talk': [
    { key: 'hazardTopic', label: 'Primary Safety Topic', type: 'text', placeholder: 'e.g. Working at Height – Fall Prevention', required: true },
    { key: 'crewSize', label: 'Crew Attending', type: 'number', placeholder: '6' },
  ],
  quote: [
    { key: 'laborCost', label: 'Labor Cost (USD)', type: 'number', placeholder: '4500', required: true },
    { key: 'materialsCost', label: 'Materials & Equipment (USD)', type: 'number', placeholder: '2500', required: true },
    { key: 'taxRatePercent', label: 'Tax Rate (%)', type: 'number', placeholder: '8.25' },
    { key: 'validityDays', label: 'Quote Valid For (Days)', type: 'number', placeholder: '30' },
    { key: 'paymentTerms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. Net 30, 50% deposit' },
  ],
  proposal: [
    { key: 'totalBidAmount', label: 'Proposal Value (USD)', type: 'number', placeholder: '85000' },
    { key: 'projectDuration', label: 'Proposed Duration', type: 'text', placeholder: 'e.g. 10 weeks' },
    { key: 'keyDifferentiator', label: 'Key Differentiator / Unique Value', type: 'textarea', placeholder: 'What sets your team apart on this project...' },
    { key: 'paymentTerms', label: 'Payment Terms', type: 'text', placeholder: 'e.g. Monthly progress billing, 10% retention' },
  ],
  'scope-of-work': [
    { key: 'contractValue', label: 'Contract Value (USD)', type: 'number', placeholder: '45000' },
    { key: 'projectDuration', label: 'Project Duration', type: 'text', placeholder: 'e.g. 8 weeks' },
    { key: 'exclusions', label: 'Explicit Exclusions', type: 'textarea', placeholder: 'List work, materials, or services NOT included in this scope...' },
  ],
  'change-order': [
    { key: 'originalContractValue', label: 'Original Contract Value (USD)', type: 'number', placeholder: '50000', required: true },
    { key: 'changeOrderAmount', label: 'Change Order Amount (USD)', type: 'number', placeholder: '4200', required: true, helperText: 'Positive = addition, negative = credit' },
    { key: 'reasonForChange', label: 'Reason for Change', type: 'textarea', placeholder: 'Describe what changed and why — client-directed, unforeseen conditions, etc.' },
    { key: 'scheduleDaysImpact', label: 'Schedule Impact (Calendar Days)', type: 'number', placeholder: '0', helperText: '0 if no time impact' },
  ],
  'daily-report': [
    { key: 'crewSize', label: 'Crew Headcount Today', type: 'number', placeholder: '5', required: true },
    { key: 'weatherConditions', label: 'Weather Conditions', type: 'text', placeholder: 'e.g. Clear, 78°F, low wind' },
    { key: 'workCompleted', label: 'Work Completed Today', type: 'textarea', placeholder: 'Describe the specific tasks completed during today\'s shift...' },
    { key: 'delaysOrIssues', label: 'Delays or Issues Encountered', type: 'textarea', placeholder: 'None or describe any delays, incidents, or RFIs...' },
  ],
};

interface CreateDocumentPageProps {
  params: Promise<{ type: string }>;
}

export default function CreateDocumentPage({ params }: CreateDocumentPageProps) {
  const { type } = use(params);

  const definition = getDocumentDefinition(type as DocumentTypeSlug);
  if (!definition || !definition.active) {
    notFound();
  }

  const customFields = CUSTOM_FIELDS_MAP[type] || [];

  return (
    <div className="container-app py-8">
      <UniversalCreatePage definition={definition} customFields={customFields} />
    </div>
  );
}
