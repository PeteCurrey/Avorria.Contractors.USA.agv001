/**
 * AVORRIA PROGRAMMATIC SEO TEMPLATE ARCHITECTURE
 * 
 * Formalized repeatable schemas for:
 * 1. State Contractor Compliance Guides (Jurisdiction Pillars)
 * 2. Trade-Specific Compliance & Safety Guides (Trade Pillars)
 * 
 * Guarantees substantive, state-accurate, and trade-accurate content
 * with contextual in-body pillar links and cross-linking.
 */

import { SeoPageModel, SeoBodySection } from '@/types/seo';

export interface StateSpecialtyTradeRule {
  trade: string;
  board: string;
  details: string;
}

export interface StateComplianceData {
  stateCode: string;
  jurisdictionCode: string;
  stateName: string;
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  licensingBoard: {
    name: string;
    acronym: string;
    url: string;
    description: string;
    gcRule: string;
    specialtyTrades: StateSpecialtyTradeRule[];
  };
  insuranceAndBonding: {
    generalLiability: string;
    workersComp: string;
    suretyBonds: string;
    commercialCovenants: string;
  };
  oshaOverlay: {
    planType: 'Federal OSHA' | 'State-Approved OSHA Plan';
    agency: string;
    standards: string;
    emphasisPrograms: string[];
  };
  crossLinkedTrades: Array<{
    tradeSlug: string;
    tradeName: string;
    relationshipNote: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  author?: string;
  reviewer?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export interface TradeComplianceData {
  tradeSlug: string;
  tradeName: string;
  naicsCode: string;
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  regulatoryStandards: Array<{
    code: string;
    title: string;
    requirements: string;
  }>;
  criticalHazards: Array<{
    hazard: string;
    controlStandard: string;
    mitigation: string;
  }>;
  licensingLevels: Array<{
    tier: string;
    requirements: string;
  }>;
  crossLinkedStates: Array<{
    stateSlug: string;
    stateName: string;
    specifics: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  author?: string;
  reviewer?: string;
  publishedAt?: string;
  updatedAt?: string;
}

/**
 * Generates an auditable, high-relevance State Compliance Guide (Jurisdiction Pillar)
 */
export function createStateCompliancePage(data: StateComplianceData): SeoPageModel {
  const bodySections: SeoBodySection[] = [
    {
      heading: `Statewide vs. Municipal Contractor Licensing in ${data.stateName}`,
      subheading: `Oversight by ${data.licensingBoard.name} (${data.licensingBoard.acronym})`,
      content: `${data.licensingBoard.description} Under ${data.stateName} regulatory frameworks, general contractors must understand: ${data.licensingBoard.gcRule} Contractors can manage license renewals and mandatory filings with Avorria's [automated license and COI tracking](/comply).`,
      bulletPoints: data.licensingBoard.specialtyTrades.map(
        (t) => `**${t.trade}**: Regulated by ${t.board}. ${t.details}`
      ),
    },
    {
      heading: `${data.stateName} Insurance & Bonding Requirements`,
      subheading: 'Commercial General Liability, Workers’ Comp & Surety Mandates',
      content: `Operating commercially in ${data.stateName} requires active evidence of mandatory coverage. While state minimums establish the legal floor, tier-1 general contractors and commercial project owners demand verified policy endorsements:`,
      bulletPoints: [
        `**Commercial General Liability**: ${data.insuranceAndBonding.generalLiability}`,
        `**Workers' Compensation**: ${data.insuranceAndBonding.workersComp}`,
        `**Surety Bonds**: ${data.insuranceAndBonding.suretyBonds}`,
        `**Commercial Contract Covenants**: ${data.insuranceAndBonding.commercialCovenants} You can monitor endorsement terms and expiry in Avorria's [COI tracking software](/comply).`,
      ],
    },
    {
      heading: `${data.stateName} Workplace Safety & OSHA Enforcement Overlay`,
      subheading: `${data.oshaOverlay.planType} via ${data.oshaOverlay.agency}`,
      content: `Job site safety compliance in ${data.stateName} is governed by ${data.oshaOverlay.standards}. General contractors enforce mandatory pre-task planning before crew mobilization, including [OSHA-compliant Job Hazard Analyses (JHAs)](/tools/job-hazard-analysis-jha-generator) and site safety plans.`,
      bulletPoints: data.oshaOverlay.emphasisPrograms.map(
        (prog) => `**Emphasis Program**: ${prog}`
      ),
    },
    {
      heading: `Trade-Specific Requirements in ${data.stateName}`,
      subheading: 'High-Risk Commercial Scopes & Trade Standards',
      content: `Contractors performing specialty trade work in ${data.stateName} face dedicated state qualification boards and licensing tiers. Connect your state requirements with our trade-specific compliance frameworks:`,
      bulletPoints: data.crossLinkedTrades.map(
        (trade) => `[${trade.tradeName} in ${data.stateName}](/${trade.tradeSlug}): ${trade.relationshipNote}`
      ),
    },
    {
      heading: `Proving Credibility to ${data.stateName} General Contractors`,
      subheading: 'Turn Compliance Paperwork into Winning Submittals',
      content: `General contractors and facility developers in ${data.stateName} require pre-qualification packages before awarding subcontracts. Rather than emailing loose PDFs, contractors assemble their verified licenses, insurance certificates, and safety records into an auditable [verified Contractor Passport](/contractor-passport).`,
    },
  ];

  return {
    slug: data.slug,
    pageType: 'jurisdiction_pillar',
    searchIntent: 'geographic',
    title: `${data.stateName} Contractor Licensing, Insurance & Compliance Guide`,
    h1: data.h1,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    intro: data.intro,
    keyTakeaways: [
      `Licensing authority: ${data.licensingBoard.name} (${data.licensingBoard.acronym}).`,
      `Workers' Compensation rule: ${data.insuranceAndBonding.workersComp.split('.')[0]}.`,
      `OSHA Enforcement: ${data.oshaOverlay.planType} enforced by ${data.oshaOverlay.agency}.`,
      `Verified credentials can be packaged into an auditable Contractor Passport.`,
    ],
    bodySections,
    schemaType: 'Article',
    faqs: data.faqs,
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'States', item: '/states' },
      { name: data.stateName, item: `/${data.slug}` },
    ],
    primaryCta: {
      title: `Managing Commercial Projects in ${data.stateName}?`,
      description: `Track ${data.licensingBoard.acronym} license renewals, municipal permits, and commercial insurance policies in one automated platform.`,
      buttonText: `Manage ${data.stateName} Compliance`,
      href: `/sign-up?state=${data.stateCode}`,
    },
    secondaryCta: {
      title: 'Generate Safety Documents',
      description: `Create ${data.stateName}-ready Job Hazard Analyses and site safety plans in minutes.`,
      buttonText: 'Open JHA Generator',
      href: '/tools/job-hazard-analysis-jha-generator',
    },
    relatedPages: [
      {
        title: 'Contractor Compliance Hub',
        slug: 'comply',
        description: 'Automated COI tracking and license renewal alerts.',
        type: 'commercial_hub',
      },
      {
        title: 'Contractor Passport',
        slug: 'contractor-passport',
        description: `Verified credential profile for ${data.stateName} contractors.`,
        type: 'contractor_passport',
      },
      ...data.crossLinkedTrades.slice(0, 2).map((t) => ({
        title: `${t.tradeName} Compliance`,
        slug: t.tradeSlug,
        description: t.relationshipNote,
        type: 'trade_pillar' as const,
      })),
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: data.publishedAt || '2026-09-01T00:00:00Z',
    updatedAt: data.updatedAt || '2026-09-01T00:00:00Z',
    author: data.author || 'Avorria State Regulatory Desk',
    reviewer: data.reviewer || 'Chief Compliance Officer',
    source: data.licensingBoard.name,
    sourceUrl: data.licensingBoard.url,
    jurisdictionCode: data.jurisdictionCode,
    topic: data.stateName.toLowerCase(),
  };
}

/**
 * Generates an auditable, high-relevance Trade Compliance Guide (Trade Pillar)
 */
export function createTradeCompliancePage(data: TradeComplianceData): SeoPageModel {
  const bodySections: SeoBodySection[] = [
    {
      heading: `Primary Safety Codes & Regulatory Standards for ${data.tradeName}`,
      subheading: `${data.naicsCode} Regulatory Architecture`,
      content: `${data.intro} Commercial contractors must demonstrate compliance with national consensus codes, OSHA 1926 construction regulations, and equipment safety standards. Use Avorria's [JHA generator](/tools/job-hazard-analysis-jha-generator) to automate task-specific safety documentation.`,
      bulletPoints: data.regulatoryStandards.map(
        (s) => `**${s.code} (${s.title})**: ${s.requirements}`
      ),
    },
    {
      heading: `Critical High-Risk Hazards & Hierarchy of Controls`,
      subheading: 'Pre-Task Hazard Mitigation & Required Engineering Controls',
      content: `Job site safety directors prioritize ${data.tradeName} due to severe exposure risks. Every project task requires documented evaluation of hazards and mandatory control measures:`,
      bulletPoints: data.criticalHazards.map(
        (h) => `**${h.hazard}**: Enforced by ${h.controlStandard}. Required mitigation: ${h.mitigation}`
      ),
    },
    {
      heading: `Trade Licensing Tiers, Certifications & Personnel Qualification`,
      subheading: 'Master, Journeyman & Competent Person Requirements',
      content: `Meeting general contractor bid requirements for ${data.tradeName} requires active personnel licensing and statutory safety credentials on record. Manage credential renewals with our [automated license and COI tracking](/comply):`,
      bulletPoints: data.licensingLevels.map(
        (l) => `**${l.tier}**: ${l.requirements}`
      ),
    },
    {
      heading: `State-Specific Licensing & Regulatory Variations`,
      subheading: 'Jurisdictional Oversight Across Key Construction Markets',
      content: `While federal OSHA sets universal workplace safety minimums, state licensing boards enforce differing trade exams, continuing education, and insurance minimums across states:`,
      bulletPoints: data.crossLinkedStates.map(
        (st) => `[${data.tradeName} in ${st.stateName}](/${st.stateSlug}): ${st.specifics}`
      ),
    },
    {
      heading: `Commercial Pre-Qualification & Winning Work as a ${data.tradeName} Contractor`,
      subheading: 'Auditable Credibility for Commercial Bids',
      content: `Commercial general contractors review ${data.tradeName} subcontractors on safety metrics (EMR rating, OSHA recordable incidents) and credential validity. Showcase your safety record and verified licenses with an auditable [verified Contractor Passport](/contractor-passport).`,
    },
  ];

  return {
    slug: data.slug,
    pageType: 'trade_pillar',
    searchIntent: 'trade',
    title: `${data.tradeName} Compliance, Safety & JHA Standards`,
    h1: data.h1,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    intro: data.intro,
    keyTakeaways: [
      `Governing codes: ${data.regulatoryStandards.map((s) => s.code).slice(0, 3).join(', ')}.`,
      `Mandatory pre-task planning: site-specific JHAs with verified Hierarchy of Controls.`,
      `License tracking across apprentice, journeyman, and master qualification tiers.`,
      `Direct integration with Avorria's JHA Generator and Contractor Passport.`,
    ],
    bodySections,
    schemaType: 'Article',
    faqs: data.faqs,
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Industries', item: '/industries' },
      { name: data.tradeName, item: `/${data.slug}` },
    ],
    primaryCta: {
      title: `Generate a Compliant ${data.tradeName} JHA`,
      description: `Pre-configured with ${data.regulatoryStandards[0]?.code || 'OSHA'} safety controls, hazard mitigation, and PPE requirements.`,
      buttonText: `Create ${data.tradeName} JHA Free`,
      href: `/tools/job-hazard-analysis-jha-generator?trade=${data.tradeSlug}`,
    },
    secondaryCta: {
      title: 'Build Verified Trade Profile',
      description: `Consolidate trade licenses and Certificates of Insurance into an auditable digital credential.`,
      buttonText: 'View Contractor Passport',
      href: '/contractor-passport',
    },
    relatedPages: [
      {
        title: 'Job Hazard Analysis Generator',
        slug: 'tools/job-hazard-analysis-jha-generator',
        description: `Interactive task hazard analysis generator for ${data.tradeName}.`,
        type: 'interactive_tool',
      },
      {
        title: 'Contractor Compliance Hub',
        slug: 'comply',
        description: 'Automated COI and trade license tracking.',
        type: 'commercial_hub',
      },
      ...data.crossLinkedStates.slice(0, 2).map((s) => ({
        title: `${s.stateName} Contractor Requirements`,
        slug: s.stateSlug,
        description: s.specifics,
        type: 'jurisdiction_pillar' as const,
      })),
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: data.publishedAt || '2026-09-01T00:00:00Z',
    updatedAt: data.updatedAt || '2026-09-01T00:00:00Z',
    author: data.author || 'Avorria Trade Engineering Panel',
    reviewer: data.reviewer || 'Director of Safety Engineering',
    source: data.regulatoryStandards[0]?.title || 'OSHA Standards',
    tradeSlug: data.tradeSlug,
    topic: data.tradeSlug,
  };
}
