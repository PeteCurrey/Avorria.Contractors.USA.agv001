/**
 * AVORRIA CENTRAL BRAND & SITE CONFIGURATION
 * 
 * IMPORTANT: Brand name and URLs are centralized here.
 * Never hard-code brand strings across templates or components.
 */

export const siteConfig = {
  // Brand Configuration
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Avorria',
  legalName: 'Avorria Technologies Inc.',
  tagline: 'The Professional Operating, Documentation & Credibility Platform for Contractors',
  description: 
    'Avorria helps commercial and residential contractors create professional business documents, manage compliance, verify credentials, and win more high-value work.',
  
  // URL and Deployment Configuration
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://avorria.com',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/app` : 'https://avorria.com/app',
  
  // Primary Launch Market & Terminology Settings
  defaultCountry: 'US',
  defaultJurisdiction: process.env.NEXT_PUBLIC_DEFAULT_JURISDICTION || 'US_FED',
  locale: 'en-US',
  currency: 'USD',
  currencySymbol: '$',

  // Company / Support Information
  supportEmail: 'support@avorria.com',
  contactEmail: 'contact@avorria.com',
  pressEmail: 'press@avorria.com',

  // Five Core Product Pillars
  pillars: [
    {
      id: 'business',
      name: 'Business',
      label: 'Contractor Business Profile',
      description: 'Centralized company intelligence, licenses, insurance, employees, and trade credentials.',
      path: '/app/business',
    },
    {
      id: 'create',
      name: 'Create',
      label: 'Professional Document Creation',
      description: 'Production-ready JHAs, JSAs, safety plans, toolbox talks, quotes, proposals, and change orders.',
      path: '/create',
    },
    {
      id: 'comply',
      name: 'Comply',
      label: 'Compliance Management',
      description: 'Proactive tracking of insurance expiration, trade licenses, OSHA certifications, and state rules.',
      path: '/contractor-compliance',
    },
    {
      id: 'prove',
      name: 'Prove',
      label: 'Contractor Passport & Verification',
      description: 'Verified contractor profile demonstrating professional standards, valid COIs, and verified credentials.',
      path: '/contractor-passport',
    },
    {
      id: 'win',
      name: 'Win',
      label: 'Bidding & Proposal Excellence',
      description: 'Winning bids, client-ready documentation packs, and high-trust verified profile sharing.',
      path: '/win-work',
    },
  ] as const,

  // Marketing Navigation Links
  mainNav: [
    { title: 'Platform', href: '/platform' },
    { title: 'Create', href: '/create' },
    { title: 'Compliance', href: '/contractor-compliance' },
    { title: 'Contractor Passport', href: '/contractor-passport' },
    { title: 'Verification', href: '/contractor-verification' },
    { title: 'Tools', href: '/tools' },
    { title: 'Templates', href: '/templates' },
    { title: 'Pricing', href: '/pricing' },
  ],

  // Footer Navigation Links
  footerNav: {
    platform: [
      { title: 'Platform Overview', href: '/platform' },
      { title: 'Document Engine', href: '/create' },
      { title: 'Compliance Hub', href: '/contractor-compliance' },
      { title: 'Contractor Passport', href: '/contractor-passport' },
      { title: 'Verification Program', href: '/contractor-verification' },
      { title: 'Win Work & Proposals', href: '/win-work' },
      { title: 'Pricing Plans', href: '/pricing' },
    ],
    tools: [
      { title: 'JHA Generator', href: '/tools/job-hazard-analysis-jha-generator' },
      { title: 'Quote Calculator', href: '/tools/contractor-quote-calculator' },
      { title: 'All Tools', href: '/tools' },
    ],
    templates: [
      { title: 'JHA Template', href: '/templates/job-hazard-analysis-jha' },
      { title: 'JSA Template', href: '/templates/job-safety-analysis-jsa' },
      { title: 'Safety Plan Template', href: '/templates/construction-safety-plan' },
      { title: 'Toolbox Talk Template', href: '/templates/toolbox-talk' },
      { title: 'Contractor Proposal Template', href: '/templates/contractor-proposal' },
      { title: 'Change Order Template', href: '/templates/change-order' },
    ],
    resources: [
      { title: 'Compliance Checklist', href: '/guides/contractor-compliance-checklist' },
      { title: 'Electrical Contractor Compliance', href: '/industries/electrical-contractor-compliance' },
      { title: 'Texas Contractor Requirements', href: '/states/texas-contractor-requirements' },
    ],
    legal: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Regulatory Disclaimer', href: '/disclaimer' },
    ],
  },
};

export type SiteConfig = typeof siteConfig;
