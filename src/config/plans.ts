/**
 * AVORRIA CONFIGURABLE PRICING & ENTITLEMENTS ARCHITECTURE
 * 
 * Never hard-code pricing across components.
 * Plans support monthly/annual billing, trial limits, and feature entitlements.
 */

export interface PlanEntitlement {
  id: 'free' | 'professional' | 'verified' | 'business';
  name: string;
  badge?: string;
  description: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  featured?: boolean;
  limits: {
    monthlyDocuments: number; // -1 for unlimited
    teamMembers: number;
    activeProjects: number;
    storedCertificates: number;
  };
  features: {
    title: string;
    included: boolean;
  }[];
  entitlements: {
    canGenerateJha: boolean;
    canGenerateJsa: boolean;
    canGenerateSafetyPlan: boolean;
    canTrackInsuranceExpiry: boolean;
    hasContractorPassport: boolean;
    hasVerifiedBadge: boolean;
    hasPublicProfile: boolean;
    canExportPdf: boolean;
    hasApiAccess: boolean;
    customBranding: boolean;
  };
  ctaLabel: string;
}

export const PRICING_PLANS: PlanEntitlement[] = [
  {
    id: 'free',
    name: 'Free Starter',
    description: 'Essential contractor business profile and limited document generation for sole proprietors.',
    monthlyPriceCents: 0,
    annualPriceCents: 0,
    limits: {
      monthlyDocuments: 3,
      teamMembers: 1,
      activeProjects: 2,
      storedCertificates: 3,
    },
    features: [
      { title: 'Standard Contractor Business Profile', included: true },
      { title: '3 Free JHA / JSA Document Downloads / Month', included: true },
      { title: 'Basic Insurance & License Expiration Tracking', included: true },
      { title: 'Contractor Readiness Score Self-Assessment', included: true },
      { title: 'Full Construction Safety Plans', included: false },
      { title: 'Verified Contractor Passport & Badge', included: false },
      { title: 'Public Verified Profile Listing', included: false },
      { title: 'Team Multi-User Management', included: false },
    ],
    entitlements: {
      canGenerateJha: true,
      canGenerateJsa: true,
      canGenerateSafetyPlan: false,
      canTrackInsuranceExpiry: true,
      hasContractorPassport: false,
      hasVerifiedBadge: false,
      hasPublicProfile: false,
      canExportPdf: true,
      hasApiAccess: false,
      customBranding: false,
    },
    ctaLabel: 'Start Free',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Comprehensive documentation and automated compliance management for active trade contractors.',
    monthlyPriceCents: 4900, // $49/mo
    annualPriceCents: 47000, // ~$39/mo billed annually ($470/yr)
    featured: true,
    badge: 'Most Popular',
    limits: {
      monthlyDocuments: 50,
      teamMembers: 3,
      activeProjects: 15,
      storedCertificates: 25,
    },
    features: [
      { title: 'Unlimited JHA, JSA & Toolbox Talks', included: true },
      { title: 'Site-Specific Construction Safety Plans', included: true },
      { title: 'Proactive Expiration Alerts (COI, Licenses, OSHA)', included: true },
      { title: 'Professional Quotes, Estimates & Change Orders', included: true },
      { title: 'Clean PDF Export with Company Branding', included: true },
      { title: 'Contractor Passport Preview', included: true },
      { title: 'Third-Party Credential Verification', included: false },
      { title: 'Public Verified Trust Profile', included: false },
    ],
    entitlements: {
      canGenerateJha: true,
      canGenerateJsa: true,
      canGenerateSafetyPlan: true,
      canTrackInsuranceExpiry: true,
      hasContractorPassport: true,
      hasVerifiedBadge: false,
      hasPublicProfile: false,
      canExportPdf: true,
      hasApiAccess: false,
      customBranding: true,
    },
    ctaLabel: 'Start 14-Day Pro Trial',
  },
  {
    id: 'verified',
    name: 'Verified Contractor',
    description: 'Complete operating suite with third-party evidence verification and public trust profile to win bids.',
    monthlyPriceCents: 9900, // $99/mo
    annualPriceCents: 95000, // ~$79/mo billed annually ($950/yr)
    badge: 'Trust & Winning Work',
    limits: {
      monthlyDocuments: -1, // Unlimited
      teamMembers: 10,
      activeProjects: 50,
      storedCertificates: 100,
    },
    features: [
      { title: 'All Professional Plan Features Included', included: true },
      { title: 'Evidence-Based Credential Verification (COI, Licenses, OSHA)', included: true },
      { title: 'Public Verified Contractor Passport Profile', included: true },
      { title: 'Official Digital Trust Badge for Websites & Proposals', included: true },
      { title: 'Direct Client Share Links & Audit-Ready Packs', included: true },
      { title: 'OSHA 10/30 Employee Training Matrix Tracking', included: true },
      { title: 'Priority Document Review & Verification Support', included: true },
      { title: 'Enterprise Dedicated Account Manager', included: false },
    ],
    entitlements: {
      canGenerateJha: true,
      canGenerateJsa: true,
      canGenerateSafetyPlan: true,
      canTrackInsuranceExpiry: true,
      hasContractorPassport: true,
      hasVerifiedBadge: true,
      hasPublicProfile: true,
      canExportPdf: true,
      hasApiAccess: false,
      customBranding: true,
    },
    ctaLabel: 'Get Verified',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'High-capacity compliance, subcontractor oversight, and custom workflows for growing GC & multi-crew firms.',
    monthlyPriceCents: 19900, // $199/mo
    annualPriceCents: 191000, // ~$159/mo billed annually ($1,910/yr)
    limits: {
      monthlyDocuments: -1,
      teamMembers: 50,
      activeProjects: 200,
      storedCertificates: 500,
    },
    features: [
      { title: 'Everything in Verified Plan', included: true },
      { title: 'Subcontractor Pre-qualification & COI Tracking', included: true },
      { title: 'Custom Document Templates & Approval Workflows', included: true },
      { title: 'Full Team Audit Logs & Activity History', included: true },
      { title: 'Equipment Maintenance & Inspection Logs', included: true },
      { title: 'Dedicated Onboarding & Compliance Advisor', included: true },
      { title: 'REST API & Webhook Access (Coming Soon)', included: false },
      { title: 'SLA & Multi-Organization Billing', included: true },
    ],
    entitlements: {
      canGenerateJha: true,
      canGenerateJsa: true,
      canGenerateSafetyPlan: true,
      canTrackInsuranceExpiry: true,
      hasContractorPassport: true,
      hasVerifiedBadge: true,
      hasPublicProfile: true,
      canExportPdf: true,
      hasApiAccess: true,
      customBranding: true,
    },
    ctaLabel: 'Contact Sales / Enterprise',
  },
];
