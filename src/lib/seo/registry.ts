/**
 * AVORRIA INITIAL STRATEGIC SEO PAGE REPOSITORY (SEED & FALLBACK DATA)
 * 
 * High-value initial content clusters covering:
 * 1. Commercial / Platform Hubs
 * 2. High-Intent Contractor Tools
 * 3. Core Safety & Commercial Document Templates
 * 4. Compliance Guides & State Regulatory Frameworks
 * 5. Trade-Specific Compliance Foundations
 * 6. Contractor Passport & Verification
 * 
 * Conforms to US terminology standards (JHA, JSA, Safety Plan, Toolbox Talk, SDS, COI, OSHA).
 */

import { SeoPageModel } from '@/types/seo';
import { createStateCompliancePage, createTradeCompliancePage } from './templates/state-trade-template';

export const INITIAL_SEO_PAGES: SeoPageModel[] = [
  // 1. Core Platform Hub
  {
    slug: 'platform',
    pageType: 'commercial_hub',
    searchIntent: 'commercial',
    title: 'Avorria Contractor Operating & Compliance Platform',
    h1: 'The Professional Operating Platform for US Trade Contractors',
    metaTitle: 'Contractor Operating, Documentation & Compliance Platform | Avorria',
    metaDescription: 'Streamline contractor documentation, OSHA compliance, Certificate of Insurance tracking, and client proposals on one unified US contractor platform.',
    intro: 'Avorria gives trade contractors and commercial builders a single professional system to create job-ready documents, maintain active compliance, prove credibility, and win profitable tenders.',
    keyTakeaways: [
      'Centralized contractor records: COIs, state licenses, OSHA 10/30 cards, and safety programs.',
      'Fast document creation: Site-specific JHAs, JSAs, Safety Plans, and professional proposals.',
      'Verified Contractor Passport: Demonstrable compliance evidence to win tier-1 commercial bids.',
    ],
    bodySections: [
      {
        heading: 'Built Around Five Core Contractor Pillars',
        content: 'Contractors operate in demanding environments where disorganized compliance, expired certificates of insurance, or unformatted quotes cost valuable bids. Avorria organizes your entire business operations around Business Intelligence, [Professional Document Creation](/create), [COI & Compliance Governance](/comply), [Credibility Verification](/contractor-verification), and [Winning High-Value Work](/win-work).',
      },
      {
        heading: 'From Documentation to Public Trust',
        content: 'Unlike standalone form generators or fragmented accounting software, Avorria builds a continuous chain of credibility: from your first [Job Hazard Analysis (JHA)](/tools/job-hazard-analysis-jha-generator) to a fully verified digital [Contractor Passport](/contractor-passport) that general contractors and project owners trust.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Is Avorria an official OSHA certification body or government agency?',
        answer: 'No. Avorria is a private software platform and contractor operating system. It provides operational tools, structured compliance workflows, and digital documentation templates aligned with industry best practices, but does not issue government licenses or official regulatory certifications.',
      },
      {
        question: 'Can I track subcontractor compliance inside Avorria?',
        answer: 'Yes. The Business plan supports subcontractor prequalification, tracking active Certificates of Insurance (COI), state trade licenses, and site orientation logs.',
      },
      {
        question: 'How does Avorria integrate with existing contractor workflows?',
        answer: 'Avorria operates as an agile web application accessible via mobile, tablet, and desktop, allowing field superintendents to generate safety documents on site while office staff track insurance and bid submittals.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Platform', item: '/platform' },
    ],
    primaryCta: {
      title: 'Ready to Professionalize Your Contracting Business?',
      description: 'Start your free trial today. Build your business profile and generate your first JHA in minutes.',
      buttonText: 'Get Started Free',
      href: '/sign-up',
    },
    secondaryCta: {
      title: 'Explore Pricing Plans',
      description: 'Compare features across Starter, Professional, Verified, and Business tiers.',
      buttonText: 'View Pricing',
      href: '/pricing',
    },
    relatedPages: [
      { title: 'Contractor Compliance Hub', slug: 'contractor-compliance', description: 'Comprehensive insurance and OSHA compliance management.', type: 'compliance_guide' },
      { title: 'Contractor Passport', slug: 'contractor-passport', description: 'Verified digital credential profile.', type: 'contractor_passport' },
      { title: 'Job Hazard Analysis Generator', slug: 'tools/job-hazard-analysis-jha-generator', description: 'Interactive JHA creation tool.', type: 'interactive_tool' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Editorial Team',
    reviewer: 'Chief Product Officer',
    topic: 'platform',
  },

  // 2. Document Creation Hub (/create)
  {
    slug: 'create',
    pageType: 'commercial_hub',
    searchIntent: 'commercial',
    title: 'Professional Contractor Document Creation Engine',
    h1: 'Generate Job-Ready Safety, Estimating & Commercial Documents',
    metaTitle: 'Contractor Document Creation Engine | JHA, Safety Plans, Quotes | Avorria',
    metaDescription: 'Create professional, OSHA-aligned contractor documents in minutes: Job Hazard Analyses (JHA), Construction Safety Plans, Toolbox Talks, Quotes, and Proposals.',
    intro: 'Eliminate disorganized Word docs and outdated clipboards. Avorria empowers contractors to generate clear, branded, and compliant documents built for US job sites.',
    bodySections: [
      {
        heading: 'Safety Documentation Engineered for Job Sites',
        content: 'Meet general contractor site access requirements with structured [Job Hazard Analyses (JHA)](/tools/job-hazard-analysis-jha-generator), [Job Safety Analyses (JSA)](/templates/job-safety-analysis-jsa), and site-specific [written safety plans](/templates/construction-safety-plan) formatted for instant PDF export.',
      },
      {
        heading: 'Commercial Documents That Win Bids',
        content: 'Turn site measurements and scopes of work into polished [client proposals](/templates/contractor-proposal), binding quotes using our [contractor quote calculator](/tools/contractor-quote-calculator), and detailed [change orders](/templates/change-order) that protect your margins and prevent payment disputes.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'What document formats can I export?',
        answer: 'All documents can be exported as professional, high-resolution PDFs with your company branding, or shared directly via secure web links.',
      },
      {
        question: 'Are generated documents compliant with OSHA 1926 standards?',
        answer: 'Yes. Templates follow OSHA 1926 construction safety requirements and incorporate standard task hazard identification and hierarchy of control methodologies.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Create', item: '/create' },
    ],
    primaryCta: {
      title: 'Generate Your First Document',
      description: 'Choose from our library of verified contractor templates or use our interactive generators.',
      buttonText: 'Create Document Now',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'JHA Template', slug: 'templates/job-hazard-analysis-jha', description: 'OSHA-aligned Job Hazard Analysis template.', type: 'document_template' },
      { title: 'Construction Safety Plan Template', slug: 'templates/construction-safety-plan', description: 'Comprehensive written safety program.', type: 'document_template' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Safety & Compliance Desk',
    topic: 'create',
  },

  // 3. Contractor Compliance Hub (/contractor-compliance)
  {
    slug: 'contractor-compliance',
    pageType: 'compliance_guide',
    searchIntent: 'compliance',
    title: 'Contractor Compliance Management & Expiration Tracking',
    h1: 'Proactive Contractor Compliance: Insurance, Licenses & OSHA',
    metaTitle: 'Contractor Compliance Management System | COI & License Tracking | Avorria',
    metaDescription: 'Track Certificates of Insurance (COI), state trade licenses, workers comp, and OSHA certifications. Never miss a renewal deadline or get locked out of a job site.',
    intro: 'Stay active, insured, and compliant. Avorria tracks your critical business documents and alerts you before expiration dates disrupt your active projects or delay site approvals.',
    bodySections: [
      {
        heading: 'Proactive Expiration Management',
        content: 'Losing access to a commercial job site because of an expired General Liability COI or trade license costs thousands of dollars per day. Avorria continuously monitors renewal windows and alerts your team at 60, 30, and 14-day intervals through our [automated COI tracking software](/comply).',
      },
      {
        heading: 'Clear Compliance Categorization',
        content: 'Every policy, certificate, and permit is categorized under clear operational states: Current, Expiring Soon, Expired, Missing, or Not Applicable. Pair your compliance tracking with our [contractor compliance checklist](/guides/contractor-compliance-checklist) and state licensing guides such as the [Texas contractor requirements](/states/texas-contractor-requirements).',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'What types of insurance does Avorria track?',
        answer: 'Avorria tracks General Liability, Workers’ Compensation, Commercial Auto, Umbrella / Excess Liability, Inland Marine (Tools & Equipment), and Professional Liability.',
      },
      {
        question: 'How do automated expiration alerts work?',
        answer: 'Avorria scans certificate policy end dates and triggers automated email and in-app alerts at 60, 30, and 14 days prior to expiration so renewals can be processed before coverage lapses.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Compliance', item: '/contractor-compliance' },
    ],
    primaryCta: {
      title: 'Never Miss an Insurance Expiration',
      description: 'Upload your first Certificate of Insurance and set automated renewal reminders today.',
      buttonText: 'Start Compliance Tracking',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'Contractor Compliance Checklist', slug: 'guides/contractor-compliance-checklist', description: 'Essential compliance checklist for US contractors.', type: 'compliance_guide' },
      { title: 'Texas Contractor Requirements', slug: 'states/texas-contractor-requirements', description: 'State-level licensing and insurance rules for Texas.', type: 'jurisdiction_pillar' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Compliance Group',
    source: 'OSHA & Insurance Regulatory Standards',
    topic: 'compliance',
  },

  // 4. Contractor Verification Hub (/contractor-verification)
  {
    slug: 'contractor-verification',
    pageType: 'commercial_hub',
    searchIntent: 'commercial',
    title: 'Evidence-Based Contractor Verification',
    h1: 'Verified Contractor Credibility That Wins Client Trust',
    metaTitle: 'Contractor Verification & Digital Credential Auditing | Avorria',
    metaDescription: 'Stand out from unverified competitors. Avorria provides evidence-based credential review for trade licenses, insurance COIs, and safety records.',
    intro: 'Clients and general contractors need proof of legitimacy before awarding high-value contracts. Avorria transforms your active business documentation into audited proof of professional standing.',
    bodySections: [
      {
        heading: 'Transparent Platform Verification',
        content: 'Avorria does not make hollow claims or act as a government authority. Our verification status is backed by verifiable evidence: state license board lookups, active insurance certificates verified through [COI tracking](/comply), and validated safety procedures.',
      },
      {
        heading: 'The Contractor Readiness Checklist',
        content: 'Contractors achieve verified status through our transparent 10-point checklist covering entity registration, tax compliance, active liability policies, and supervisory safety training, which feeds directly into your shareable [Contractor Passport](/contractor-passport).',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How long does credential verification take?',
        answer: 'Most document inspections and state board registry checks are completed within 1 to 2 business days.',
      },
      {
        question: 'What happens if a license or insurance policy expires?',
        answer: 'If an underlying credential expires, the verified badge is temporarily suspended until updated documentation is uploaded and verified, protecting platform integrity.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Verification', item: '/contractor-verification' },
    ],
    primaryCta: {
      title: 'Get Your Contractor Business Verified',
      description: 'Submit your trade license and COI to build an indisputable reputation with commercial clients.',
      buttonText: 'Begin Verification',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'Contractor Passport', slug: 'contractor-passport', description: 'Digital trust profile for sharing credentials.', type: 'contractor_passport' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Credentialing Board',
    topic: 'verification',
  },

  // 5. Contractor Passport Hub (/contractor-passport)
  {
    slug: 'contractor-passport',
    pageType: 'contractor_passport',
    searchIntent: 'commercial',
    title: 'Avorria Contractor Passport: Verified Profile & Credentials',
    h1: 'The Digital Contractor Passport for the Modern Construction Industry',
    metaTitle: 'Contractor Passport | Shareable Verified Profile & COI Pack | Avorria',
    metaDescription: 'A single, shareable digital credential pack containing your verified business identity, active insurance, trade licenses, safety programs, and project experience.',
    intro: 'Stop emailing 12 different PDFs every time a general contractor or commercial client asks for pre-qualification paperwork. The Avorria Contractor Passport consolidates everything into a secure, verifiable profile.',
    bodySections: [
      {
        heading: 'Everything Commercial Clients Need in One Link',
        content: 'Your Contractor Passport displays verified business registration, current Certificates of Insurance, state license status, OSHA 10/30 certifications, and written safety program summaries generated in [Avorria Document Creation](/create) in a clean, executive interface.',
      },
      {
        heading: 'Complete Control Over Your Visibility',
        content: 'Your passport is private by default. You choose when to publish, share access with specific clients, or use your profile to [win high-value commercial bids](/win-work) and attract new project inquiries.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Can general contractors view my full documents?',
        answer: 'Yes. You can generate secure, password-protected or expiring share links that allow project managers to download pre-qualification document packs directly.',
      },
      {
        question: 'Can I embed my Contractor Passport link in bids and proposals?',
        answer: 'Yes. Every verified contractor receives a personalized public or gated URL and QR code that can be embedded directly on proposals, invoices, and job-site trailer decals.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Contractor Passport', item: '/contractor-passport' },
    ],
    primaryCta: {
      title: 'Build Your Contractor Passport',
      description: 'Create a professional digital profile that sets you apart during pre-qualification and bidding.',
      buttonText: 'Claim Your Passport',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'Verification Program', slug: 'contractor-verification', description: 'How verification works.', type: 'commercial_hub' },
      { title: 'Win Work & Proposals', slug: 'win-work', description: 'Combine your passport with winning proposals.', type: 'commercial_hub' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Product Architecture',
    topic: 'passport',
  },

  // 6. Win Work Hub (/win-work)
  {
    slug: 'win-work',
    pageType: 'commercial_hub',
    searchIntent: 'commercial',
    title: 'Win More High-Value Contractor Bids & Commercial Work',
    h1: 'Turn Professional Documentation Into Competitive Advantage',
    metaTitle: 'Contractor Proposals & Bidding Excellence | Win Work | Avorria',
    metaDescription: 'Produce professional quotes, tender responses, and client-ready document packs that give commercial clients the confidence to award you the project.',
    intro: 'Commercial project owners do not just hire the lowest bidder; they hire the contractor who demonstrates the highest reliability, clear safety practices, and verified financial responsibility.',
    bodySections: [
      {
        heading: 'Differentiate with Complete Pre-qualification Packs',
        content: 'When submitting a bid, attach your [Avorria Contractor Passport](/contractor-passport), active [Job Hazard Analysis (JHA)](/tools/job-hazard-analysis-jha-generator), and current [verified COI](/comply) in one unified digital package. Show project owners that your business is ready for the site on day one.',
      },
      {
        heading: 'Clear Proposals that Prevent Payment Disputes',
        content: 'Use standardized scopes of work, itemized allowances, milestone billing schedules calculated with our [quote calculator](/tools/contractor-quote-calculator), and [change order terms](/templates/change-order) that protect your cash flow and margins.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Can I customize proposal templates with my brand logo?',
        answer: 'Yes. Professional and Verified tier accounts include full brand customization, custom color palettes, and company letterhead.',
      },
      {
        question: 'Can clients electronically sign proposals created in Avorria?',
        answer: 'Yes. Avorria proposals support digital e-signatures and milestone acceptance tracking for immediate contract execution.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Win Work', item: '/win-work' },
    ],
    primaryCta: {
      title: 'Upgrade Your Bidding Process',
      description: 'Generate high-impact proposals with embedded compliance credentials.',
      buttonText: 'Start Winning Bids',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'Contractor Proposal Template', slug: 'templates/contractor-proposal', description: 'Standard commercial construction proposal template.', type: 'document_template' },
      { title: 'Contractor Quote Calculator', slug: 'tools/contractor-quote-calculator', description: 'Estimate margins, overhead, and pricing.', type: 'interactive_tool' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Commercial Strategy Desk',
    topic: 'win-work',
  },

  // 7. Interactive Tool: JHA Generator
  {
    slug: 'tools/job-hazard-analysis-jha-generator',
    pageType: 'interactive_tool',
    searchIntent: 'tool',
    title: 'Online Job Hazard Analysis (JHA) Generator for Contractors',
    h1: 'OSHA-Aligned Job Hazard Analysis (JHA) Generator',
    metaTitle: 'Free JHA Generator | Job Hazard Analysis Tool for US Contractors | Avorria',
    metaDescription: 'Generate job-specific Job Hazard Analyses (JHA) in minutes. Identify workplace hazards, control measures, and PPE requirements aligned with OSHA standards.',
    intro: 'Identify job site hazards before work begins. Our interactive JHA generator breaks down tasks step-by-step, identifies potential safety hazards, and establishes mandatory control measures.',
    bodySections: [
      {
        heading: 'Why Every Job Site Requires a JHA',
        content: 'OSHA standard 1926 requires employers to assess the workplace to determine if hazards are present. A thorough Job Hazard Analysis isolates high-risk activities—such as working at heights, electrical isolation covered in our [electrical contractor compliance guide](/industries/electrical-contractor-compliance), trenching, or hot work—and details specific engineering and administrative controls.',
      },
      {
        heading: 'Hierarchy of Controls Integrated Into Every Step',
        content: 'Our JHA workflow guides your team through the OSHA Hierarchy of Controls: Elimination, Substitution, Engineering Controls, Administrative Controls, and Personal Protective Equipment (PPE). You can also download a static [JHA template](/templates/job-hazard-analysis-jha) or combine task analyses into a site-specific [construction safety plan](/templates/construction-safety-plan).',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'What is the difference between a JHA and a JSA?',
        answer: 'In US construction, Job Hazard Analysis (JHA) and Job Safety Analysis (JSA) are largely used interchangeably. Both systematically analyze a specific job task to uncover hazards and document protective controls.',
      },
      {
        question: 'Does OSHA require a signed JHA on site?',
        answer: 'While OSHA does not mandate a single universal JHA form, OSHA compliance officers and general contractor site safety managers require documented proof that task hazards have been evaluated and communicated to workers prior to task execution.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Tools', item: '/tools' },
      { name: 'JHA Generator', item: '/tools/job-hazard-analysis-jha-generator' },
    ],
    primaryCta: {
      title: 'Generate a Complete JHA in 3 Minutes',
      description: 'Select your trade, identify site hazards, and download a job-ready PDF immediately.',
      buttonText: 'Launch JHA Generator',
      href: '/sign-up?intent=tool_jha',
    },
    relatedPages: [
      { title: 'JHA Template (Word & PDF)', slug: 'templates/job-hazard-analysis-jha', description: 'Download static JHA form templates.', type: 'document_template' },
      { title: 'Toolbox Talk Template', slug: 'templates/toolbox-talk', description: 'Complement your JHA with weekly safety talks.', type: 'document_template' },
      { title: 'Electrical Contractor Compliance', slug: 'industries/electrical-contractor-compliance', description: 'Electrical safety standards and NFPA 70E.', type: 'trade_pillar' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Safety & Engineering Team',
    source: 'OSHA 3071 Job Hazard Analysis Guidelines',
    sourceUrl: 'https://www.osha.gov/publications/osha3071',
    topic: 'jha',
  },

  // 8. Interactive Tool: Contractor Quote Calculator
  {
    slug: 'tools/contractor-quote-calculator',
    pageType: 'interactive_tool',
    searchIntent: 'tool',
    title: 'Contractor Quote & Profit Margin Calculator',
    h1: 'Contractor Quote & Margin Calculator',
    metaTitle: 'Contractor Quote Calculator | Estimate Labor, Overhead & Profit Margin | Avorria',
    metaDescription: 'Calculate accurate contractor quotes with labor burden, materials, equipment rental, overhead markup, and target profit margins.',
    intro: 'Avoid underbidding projects. Use our contractor quote calculator to factor in real labor burden, direct job costs, company overhead, and contingency before sending quotes to clients.',
    bodySections: [
      {
        heading: 'The True Cost of Labor Burden',
        content: 'Many contractors only charge the hourly wage paid to technicians, forgetting payroll taxes (FICA, FUTA, SUTA), workers compensation insurance rates, paid time off, and field benefits. Our calculator computes full labor burden to safeguard your net margins when preparing [commercial contractor proposals](/templates/contractor-proposal).',
      },
      {
        heading: 'Markup vs. Margin: The Critical Difference',
        content: 'A 25% markup produces only a 20% profit margin. Misunderstanding this distinction leads to cash flow shortfalls. Avorria clarifies your gross profit margin against your target revenue and helps you price out unforeseen work using our [standard change order template](/templates/change-order).',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'What is a healthy profit margin for a trade contractor?',
        answer: 'Typical trade contractors target a net profit margin of 8% to 15% after all overhead and labor burden costs are fully absorbed.',
      },
      {
        question: 'How should equipment rental and consumables be calculated?',
        answer: 'Equipment and consumable costs should be calculated as direct project expenses with an applied handling markup of 10% to 15% to cover logistics and financing costs.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Tools', item: '/tools' },
      { name: 'Quote Calculator', item: '/tools/contractor-quote-calculator' },
    ],
    primaryCta: {
      title: 'Turn Calculations Into Professional Quotes',
      description: 'Export calculated estimates into legally binding contractor quotes with digital sign-off.',
      buttonText: 'Create Full Quote',
      href: '/sign-up?intent=tool_quote',
    },
    relatedPages: [
      { title: 'Contractor Proposal Template', slug: 'templates/contractor-proposal', description: 'Convert quotes into winning proposals.', type: 'document_template' },
      { title: 'Change Order Template', slug: 'templates/change-order', description: 'Manage project scope additions accurately.', type: 'document_template' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Financial Estimating Desk',
    topic: 'quote',
  },

  // 9. Template: Job Hazard Analysis (JHA)
  {
    slug: 'templates/job-hazard-analysis-jha',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Job Hazard Analysis (JHA) Template for Contractors',
    h1: 'Job Hazard Analysis (JHA) Template (Free Download)',
    metaTitle: 'JHA Template | Free Job Hazard Analysis Form (PDF & Word) | Avorria',
    metaDescription: 'Download our comprehensive Job Hazard Analysis (JHA) template designed for US construction contractors. Structured for OSHA compliance and general contractor review.',
    intro: 'Download our standardized, site-ready Job Hazard Analysis template. Break down complex tasks into chronological steps, identify mechanical and environmental hazards, and specify mandatory controls.',
    bodySections: [
      {
        heading: 'Key Components Included in This JHA Template',
        content: 'This template incorporates project metadata (Job Name, Location, Date, Supervisor), crew roster signatures, mandatory PPE checklist, task breakdown table with potential hazards and control actions, and emergency response numbers.',
      },
      {
        heading: 'Digital Generation vs. Static Paper Forms',
        content: 'While static forms provide an immediate physical sign-off on the tailgate, trade contractors generating frequent submittals use our [interactive JHA generator](/tools/job-hazard-analysis-jha-generator) to store reusable task templates and export branded PDFs attached to their [site safety plan](/templates/construction-safety-plan).',
      },
    ],
    templateSpecs: {
      format: ['PDF', 'Word Document', 'Digital Avorria Generator'],
      estimatedCompletionTime: '10 - 15 Minutes',
      jurisdictionScope: 'United States (OSHA 1926/1910 Aligned)',
      lastStandardUpdate: 'Q3 2026',
    },
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Who should complete the JHA on site?',
        answer: 'The JHA should be completed by the field supervisor or competent person in collaboration with the crew executing the work.',
      },
      {
        question: 'How often should a JHA be reviewed on the job site?',
        answer: 'JHAs should be reviewed daily during morning tailgate safety meetings and immediately updated whenever job site conditions, weather, or work methods change.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'JHA Template', item: '/templates/job-hazard-analysis-jha' },
    ],
    primaryCta: {
      title: 'Download the Free JHA Template',
      description: 'Get instant access to clean PDF and editable formats, or customize online with Avorria.',
      buttonText: 'Download Template',
      href: '/sign-up?download=jha_template',
    },
    relatedPages: [
      { title: 'Interactive JHA Generator', slug: 'tools/job-hazard-analysis-jha-generator', description: 'Build and customize online.', type: 'interactive_tool' },
      { title: 'Job Safety Analysis (JSA) Template', slug: 'templates/job-safety-analysis-jsa', description: 'Alternate task analysis format.', type: 'document_template' },
      { title: 'Construction Safety Plan Template', slug: 'templates/construction-safety-plan', description: 'Full company safety manual.', type: 'document_template' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Safety Desk',
    source: 'OSHA 1926 Safety & Health Regulations for Construction',
    topic: 'jha',
  },

  // 10. Template: Job Safety Analysis (JSA)
  {
    slug: 'templates/job-safety-analysis-jsa',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Job Safety Analysis (JSA) Template',
    h1: 'Job Safety Analysis (JSA) Form Template',
    metaTitle: 'JSA Template | Job Safety Analysis Form for Trade Contractors | Avorria',
    metaDescription: 'Free, professional Job Safety Analysis (JSA) template. Identify sequence of basic job steps, potential accidents or hazards, and recommended safe job procedures.',
    intro: 'The Job Safety Analysis (JSA) is an indispensable tool for preventing workplace injuries. Use our proven form to analyze field procedures and train workers before hazardous operations commence.',
    bodySections: [
      {
        heading: 'Three-Column JSA Methodology',
        content: 'Standardized three-column format: 1) Sequence of Basic Job Steps, 2) Potential Hazards / Accidents, and 3) Recommended Safe Job Procedures & Controls.',
      },
      {
        heading: 'Integrating JSA into Daily Crew Briefings',
        content: 'Pair your completed JSA with a structured [toolbox talk meeting](/templates/toolbox-talk) to verify that all workers understand energy isolation, fall protection anchorages, and personal protective equipment before mobilizing.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'When should a JSA be updated?',
        answer: 'A JSA must be revised whenever work conditions change, new equipment or tools are introduced, or following an incident or near-miss.',
      },
      {
        question: 'What is the key difference between JSA and JHA?',
        answer: 'JSA and JHA are fundamentally interchangeable in US construction; both systematically analyze task hazards and engineering controls to ensure worker safety.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'JSA Template', item: '/templates/job-safety-analysis-jsa' },
    ],
    primaryCta: {
      title: 'Download Free JSA Template',
      description: 'Available for immediate digital generation or PDF export.',
      buttonText: 'Download Form',
      href: '/sign-up?download=jsa_template',
    },
    relatedPages: [
      { title: 'JHA Template', slug: 'templates/job-hazard-analysis-jha', description: 'Job Hazard Analysis equivalent.', type: 'document_template' },
      { title: 'Toolbox Talk Template', slug: 'templates/toolbox-talk', description: 'Crew safety briefings.', type: 'document_template' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Safety Team',
    topic: 'jsa',
  },

  // 11. Template: Construction Safety Plan
  {
    slug: 'templates/construction-safety-plan',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Site-Specific Construction Safety Plan Template',
    h1: 'Site-Specific Construction Safety Plan (HASP) Template',
    metaTitle: 'Construction Safety Plan Template | Site-Specific Safety Program | Avorria',
    metaDescription: 'Comprehensive site-specific safety plan template. Covers emergency procedures, OSHA requirements, subcontractor rules, hazard communication, and competent person designations.',
    intro: 'Commercial developers and general contractors require a written, site-specific safety plan before approving trade subcontractors. This template delivers an audit-ready safety manual tailored to your scope.',
    bodySections: [
      {
        heading: 'Complete Scope of a Professional Site Safety Plan',
        content: 'Includes Management Commitment Statement, Emergency Action Plans, Designated Competent Persons, Hazard Communication (HAZCOM / SDS), PPE Requirements, Fall Protection Plan, and Incident Reporting protocols.',
      },
      {
        heading: 'Auditing Site Safety for Commercial Submittals',
        content: 'General contractors demand that your safety plan integrates directly with active project hazards. Ensure your project team maintains active [Job Hazard Analyses (JHAs)](/tools/job-hazard-analysis-jha-generator) and packages your safety certifications into a verified [Contractor Passport](/contractor-passport).',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Does this safety plan satisfy OSHA General Duty Clause requirements?',
        answer: 'This template provides the foundational written framework required under OSHA 1926.20/21. It must be filled out with site-specific hazard assessments and competent person details.',
      },
      {
        question: 'How frequently should a site safety plan be updated?',
        answer: 'A site safety plan should be reviewed at the start of every project phase, whenever new subcontractors are onboarded, or following any high-potential near-miss incident.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'Construction Safety Plan', item: '/templates/construction-safety-plan' },
    ],
    primaryCta: {
      title: 'Build a Site-Specific Safety Plan',
      description: 'Generate an audit-proof safety plan complete with your company logo and project specs.',
      buttonText: 'Get Safety Plan Template',
      href: '/sign-up?download=safety_plan',
    },
    relatedPages: [
      { title: 'JHA Template', slug: 'templates/job-hazard-analysis-jha', description: 'Task-level hazard analysis.', type: 'document_template' },
      { title: 'Contractor Passport', slug: 'contractor-passport', description: 'Attach your safety plan to your passport.', type: 'contractor_passport' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Safety Compliance Group',
    topic: 'safety-plan',
  },

  // 12. Template: Toolbox Talk
  {
    slug: 'templates/toolbox-talk',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Toolbox Talk Safety Meeting Template & Sign-In Sheet',
    h1: 'Toolbox Talk Template & Attendance Sign-Off Sheet',
    metaTitle: 'Toolbox Talk Template | Weekly Safety Meeting Log & Sign-In | Avorria',
    metaDescription: 'Free Toolbox Talk template with structured safety topic briefing, discussion prompts, and worker signature roster to verify OSHA safety training compliance.',
    intro: 'Weekly toolbox talks reinforce safe work practices and provide documented proof of ongoing training required by OSHA inspectors and project insurers.',
    bodySections: [
      {
        heading: 'Documenting Safety Training for Audits',
        content: 'Holding a safety meeting is only half the battle; proving it occurred with signed attendance rosters protects your business during OSHA inspections and insurance reviews.',
      },
      {
        heading: 'OSHA Recordkeeping and Attendance Verification',
        content: 'Under OSHA 1926 regulations, documented toolbox talks demonstrate employer compliance with training mandates. Pair these weekly briefings with your [contractor compliance checklist](/guides/contractor-compliance-checklist) to ensure continuous site readiness.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How often should contractors conduct toolbox talks?',
        answer: 'Best practice on commercial job sites is weekly, or at the start of any new high-risk phase (such as crane lifts or trenching).',
      },
      {
        question: 'What information must be recorded on a toolbox talk sheet?',
        answer: 'A compliant sign-in sheet must capture the date, project location, topic discussed, instructor name, and legible signatures of all attending crew members.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'Toolbox Talk', item: '/templates/toolbox-talk' },
    ],
    primaryCta: {
      title: 'Start Weekly Toolbox Talks',
      description: 'Access our template and safety topic library.',
      buttonText: 'Download Toolbox Form',
      href: '/sign-up?download=toolbox_talk',
    },
    relatedPages: [
      { title: 'JHA Template', slug: 'templates/job-hazard-analysis-jha', description: 'Task hazard analysis.', type: 'document_template' },
      { title: 'Contractor Compliance Checklist', slug: 'guides/contractor-compliance-checklist', description: 'Full compliance overview.', type: 'compliance_guide' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Training Desk',
    topic: 'toolbox-talk',
  },

  // 13. Template: Contractor Proposal
  {
    slug: 'templates/contractor-proposal',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Commercial Contractor Proposal & Bid Template',
    h1: 'Commercial Contractor Proposal & Bid Template',
    metaTitle: 'Contractor Proposal Template | Construction Bid Document (Free) | Avorria',
    metaDescription: 'Professional construction proposal template for commercial and residential contractors. Scope of work, payment schedules, terms and conditions, and client sign-off.',
    intro: 'Stand out from lowball competitors with a proposal that highlights your professional qualifications, transparent milestones, and verified compliance credentials.',
    bodySections: [
      {
        heading: 'Structure That Protects Cash Flow',
        content: 'Includes Executive Summary, Detailed Scope of Work, Exclusions & Clarifications, Payment Milestone Schedule, Change Order Terms, and Contract Acceptance.',
      },
      {
        heading: 'Connecting Estimates to Formal Submittals',
        content: 'Bridge your financial estimates directly into enforceable contracts. Calculate accurate overhead and margins with our [contractor quote calculator](/tools/contractor-quote-calculator) and clearly define scope boundaries with our [change order template](/templates/change-order).',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How do proposal terms prevent scope creep?',
        answer: 'Our template includes explicit "Clarifications and Exclusions" clauses, stipulating that any work outside the defined scope requires an executed change order.',
      },
      {
        question: 'What payment schedule structure is best for trade subcontracts?',
        answer: 'A mobilization deposit (10-20%), progress billing tied to verified milestones, and a final retainage release upon substantial completion protects cash flow and prevents contractor financing burdens.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'Contractor Proposal', item: '/templates/contractor-proposal' },
    ],
    primaryCta: {
      title: 'Create a Winning Contractor Proposal',
      description: 'Build a polished, branded proposal in minutes.',
      buttonText: 'Use Proposal Template',
      href: '/sign-up?download=contractor_proposal',
    },
    relatedPages: [
      { title: 'Change Order Template', slug: 'templates/change-order', description: 'Manage project scope additions.', type: 'document_template' },
      { title: 'Contractor Quote Calculator', slug: 'tools/contractor-quote-calculator', description: 'Estimate margins and overhead.', type: 'interactive_tool' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Commercial Strategy',
    topic: 'proposal',
  },

  // 14. Template: Change Order
  {
    slug: 'templates/change-order',
    pageType: 'document_template',
    searchIntent: 'template',
    title: 'Construction Change Order Template & Agreement',
    h1: 'Standard Construction Change Order Template',
    metaTitle: 'Change Order Template | Construction Contract Modification Form | Avorria',
    metaDescription: 'Legally binding construction change order template. Document scope modifications, cost additions, schedule adjustments, and owner authorization.',
    intro: 'Never perform out-of-scope work on a handshake. Our construction change order template formally records modifications to the contract price and project completion date before work begins.',
    bodySections: [
      {
        heading: 'Protecting Profit Margins on the Job Site',
        content: 'Unapproved changes destroy contractor profitability. A signed change order guarantees that additional labor, materials, and time extensions are documented and agreed upon.',
      },
      {
        heading: 'Managing Unforeseen Job-Site Conditions',
        content: 'When subsurface or hidden mechanical conflicts arise, execute a change order that references the original [contractor proposal](/templates/contractor-proposal) and adjusts milestones, preserving project trust while protecting margins.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'When should a change order be executed?',
        answer: 'A change order should always be signed by both the contractor and project owner BEFORE the additional work is initiated.',
      },
      {
        question: 'Can change orders adjust project schedules as well as cost?',
        answer: 'Yes. Every change order should explicitly declare the number of calendar days added to the substantial completion deadline to prevent liquidated damages.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Templates', item: '/templates' },
      { name: 'Change Order', item: '/templates/change-order' },
    ],
    primaryCta: {
      title: 'Download Change Order Template',
      description: 'Protect your project revenue with clear, written scope modification agreements.',
      buttonText: 'Download Change Order',
      href: '/sign-up?download=change_order',
    },
    relatedPages: [
      { title: 'Contractor Proposal Template', slug: 'templates/contractor-proposal', description: 'Original contract agreement basis.', type: 'document_template' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Contract Operations',
    topic: 'change-order',
  },

  // 15. Guide: Contractor Compliance Checklist
  {
    slug: 'guides/contractor-compliance-checklist',
    pageType: 'compliance_guide',
    searchIntent: 'compliance',
    title: 'The Essential US Contractor Compliance Checklist (2026)',
    h1: 'The Complete US Contractor Compliance Checklist',
    metaTitle: 'Contractor Compliance Checklist | Business, Insurance & OSHA Guide | Avorria',
    metaDescription: 'A practical, 30-point compliance checklist for commercial and residential contractors. Covers state licensing, insurance COIs, OSHA safety programs, and W-9s.',
    intro: 'Managing contractor compliance across federal OSHA requirements, state licensing boards, and client insurance covenants can be overwhelming. This guide details every necessary requirement.',
    bodySections: [
      {
        heading: '1. Business Entity & Tax Registration',
        content: 'Active legal registration (LLC, Inc.), registered agent, active state status, and verified Federal EIN. Maintain a clean W-9 form on file for accounts payable clearance.',
      },
      {
        heading: '2. Insurance Minimums & Active COIs',
        content: 'General Liability ($1M occurrence / $2M aggregate minimum), statutory Workers’ Compensation, Commercial Auto Liability ($1M combined single limit), and Umbrella Liability where required by tier-1 GCs. Manage these policies automatically in our [COI tracking software](/comply).',
      },
      {
        heading: '3. State Trade Licensing & Bonding',
        content: 'Active license in your specific trade category with qualifying party designated. Surety bonds verified where mandated by state licensing statutes like the [California CSLB requirements](/states/california-contractor-requirements) or [Texas TDLR standards](/states/texas-contractor-requirements).',
      },
      {
        heading: '4. OSHA Safety Standards & Training Records',
        content: 'Written Safety Program, active site Hazard Communication (SDS binder), documented competent persons, and OSHA 10/30-hour training cards for crew leaders. Generate site-specific [Job Hazard Analyses (JHAs)](/tools/job-hazard-analysis-jha-generator) before crews mobilize.',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'Who enforces contractor compliance?',
        answer: 'Compliance is enforced by state licensing boards (e.g. CSLB in California, TDLR in Texas), federal OSHA compliance officers, insurance underwriters, and general contractor safety managers.',
      },
      {
        question: 'How often should contractor compliance documents be audited?',
        answer: 'Contractors should conduct quarterly internal compliance audits to verify that insurance policies, endorsements, trade licenses, and employee safety certifications are active and up to date.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Guides', item: '/guides' },
      { name: 'Compliance Checklist', item: '/guides/contractor-compliance-checklist' },
    ],
    primaryCta: {
      title: 'Automate Your Compliance Checklist',
      description: 'Let Avorria track your licenses, insurance expiration dates, and employee training automatically.',
      buttonText: 'Automate Compliance Now',
      href: '/sign-up',
    },
    relatedPages: [
      { title: 'Contractor Compliance Hub', slug: 'contractor-compliance', description: 'Platform compliance tracker.', type: 'compliance_guide' },
      { title: 'Texas Contractor Requirements', slug: 'states/texas-contractor-requirements', description: 'State-specific rules for Texas.', type: 'jurisdiction_pillar' },
      { title: 'Electrical Contractor Compliance', slug: 'industries/electrical-contractor-compliance', description: 'Trade-specific electrical rules.', type: 'trade_pillar' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Regulatory Research Group',
    source: 'Federal & State Construction Compliance Mandates',
    topic: 'compliance',
  },

  // 16. Trade Pillar: Electrical Contractor Compliance
  createTradeCompliancePage({
    tradeSlug: 'electrical',
    tradeName: 'Electrical Contracting',
    naicsCode: 'NAICS 238210',
    slug: 'industries/electrical-contractor-compliance',
    h1: 'Electrical Contractor Safety & NFPA 70E Compliance Standards',
    metaTitle: 'Electrical Contractor Compliance | NFPA 70E, OSHA & JHA Guide | Avorria',
    metaDescription: 'Essential compliance requirements for electrical contractors. Arc flash safety, NFPA 70E standards, OSHA lockout/tagout (LOTO), and trade license management.',
    intro: 'Electrical contracting carries some of the highest job site risks in the commercial construction industry. Complying with NFPA 70E, OSHA 1926 Subpart K, and master electrician licensing standards is non-negotiable for commercial work.',
    regulatoryStandards: [
      {
        code: 'NFPA 70 / NEC 2023',
        title: 'National Electrical Code',
        requirements: 'Mandatory installation minimums for branch circuits, feeders, service equipment grounding, and overcurrent protection across commercial structures.',
      },
      {
        code: 'NFPA 70E 2024',
        title: 'Standard for Electrical Safety in the Workplace',
        requirements: 'Mandatory energized electrical work permits, shock hazard boundaries, and Arc Flash Hazard Analysis with calibrated Category 1 through 4 PPE.',
      },
      {
        code: 'OSHA 1926 Subpart K',
        title: 'Electrical Safety in Construction',
        requirements: 'Ground fault circuit interrupters (GFCI) or Assured Equipment Grounding Conductor Programs (AEGCP) for temporary power on all job sites.',
      },
      {
        code: 'OSHA 1910.147 / 1926.417',
        title: 'Control of Hazardous Energy (Lockout/Tagout)',
        requirements: 'Documented zero energy verification, standardized red lock and tag isolation, and multi-meter testing prior to work on de-energized conductors.',
      },
    ],
    criticalHazards: [
      {
        hazard: 'Arc Flash & Blast Exposure',
        controlStandard: 'NFPA 70E Article 130',
        mitigation: 'Conduct incident energy calculation, install warning labels, de-energize equipment when feasible, and require arc-rated face shields and 40 cal/cm² flash suits for high-energy panels.',
      },
      {
        hazard: 'Energized Bus Contact & Shock',
        controlStandard: 'OSHA 1926.416(a)(1)',
        mitigation: 'Implement physical barriers, insulated hand tools rated to 1,000V, and insulating rubber gloves with leather protectors tested every 6 months.',
      },
      {
        hazard: 'Trenching & Underground Feeder Strikes',
        controlStandard: 'OSHA 1926 Subpart P',
        mitigation: 'Mandatory 811 utility locate call, hand-digging / potholing within tolerance zones, and trench shoring or shielding deeper than 5 feet.',
      },
    ],
    licensingLevels: [
      {
        tier: 'Apprentice Electrician',
        requirements: 'Enrolled in an approved state or federal BAT apprenticeship program; must perform work under direct on-site supervision of a licensed Journeyman.',
      },
      {
        tier: 'Journeyman Electrician',
        requirements: 'Minimum 8,000 hours (4 years) documented on-the-job training and passing score on the state NEC code examination.',
      },
      {
        tier: 'Master Electrician / Qualifying Party',
        requirements: 'Minimum 12,000 hours experience, advanced business and code exam passage; serves as designated license qualifier for commercial contracts.',
      },
    ],
    crossLinkedStates: [
      {
        stateSlug: 'states/texas-contractor-requirements',
        stateName: 'Texas',
        specifics: 'Statewide Master Electrician license required through TDLR with statutory general liability minimums.',
      },
      {
        stateSlug: 'states/california-contractor-requirements',
        stateName: 'California',
        specifics: 'CSLB Class C-10 Electrical Contractor license required with mandatory workers compensation filing.',
      },
      {
        stateSlug: 'states/florida-contractor-requirements',
        stateName: 'Florida',
        specifics: 'DBPR Electrical Contractors Licensing Board (ECLB) Certified Electrical (EC) statewide license.',
      },
    ],
    faqs: [
      {
        question: 'When is an electrical contractor required to have a written safety plan?',
        answer: 'General contractors and commercial owners require a written, site-specific safety plan for any electrical scope undertaking energized work, transformer installations, or contracts exceeding $10,000.',
      },
      {
        question: 'What is required in an OSHA-compliant electrical JHA?',
        answer: 'An electrical JHA must break down task steps, identify specific voltage thresholds and arc flash boundary distances, document LOTO lock/tag serial numbers, and list calibrated PPE.',
      },
      {
        question: 'How do general contractors verify an electrical subcontractor’s licenses?',
        answer: 'Commercial GCs verify active standing on state licensing board registries, valid Certificates of Insurance naming the GC as Additional Insured, and certified OSHA 10/30-Hour supervisory cards.',
      },
    ],
  }),

  // 17. Trade Pillar: HVAC & Mechanical Contractor Compliance
  createTradeCompliancePage({
    tradeSlug: 'hvac',
    tradeName: 'HVAC & Mechanical Contracting',
    naicsCode: 'NAICS 238220',
    slug: 'industries/hvac-contractor-compliance',
    h1: 'HVAC & Mechanical Contractor Compliance & EPA 608 Standards',
    metaTitle: 'HVAC Contractor Compliance | EPA 608, OSHA & Safety Guide | Avorria',
    metaDescription: 'Complete compliance guide for HVAC and mechanical contractors. EPA Section 608 refrigerant recovery, ASHRAE 15, crane rigging, and state mechanical board licensing.',
    intro: 'Mechanical and HVAC contracting combines high-voltage electrical, pressurized gas piping, crane lifts, and strict federal EPA environmental regulations. Maintaining audit-ready documentation protects project margins and contractor licenses.',
    regulatoryStandards: [
      {
        code: 'EPA Clean Air Act § 608',
        title: 'Refrigerant Management Regulations',
        requirements: 'Mandatory technician universal certification, documented leak rate calculations on commercial systems over 50 lbs, and certified recovery cylinder logs.',
      },
      {
        code: 'ASHRAE 15 & 34',
        title: 'Safety Standard for Refrigeration Systems',
        requirements: 'Mechanical room emergency ventilation rates, refrigerant concentration limits, oxygen deprivation alarms, and safety relief valve piping.',
      },
      {
        code: 'OSHA 1926 Subpart CC',
        title: 'Cranes and Derricks in Construction',
        requirements: 'Documented lift plans for rooftop package units (RTUs), qualified rigger and signal person credentials, and swing radius barricades.',
      },
    ],
    criticalHazards: [
      {
        hazard: 'Refrigerant Toxicity & Suffocation',
        controlStandard: 'ASHRAE 15 / OSHA 1910.134',
        mitigation: 'Continuous mechanical ventilation, calibrated refrigerant leak detectors, and self-contained breathing apparatus (SCBA) access during commercial chiller servicing.',
      },
      {
        hazard: 'Rooftop Falls & Opening Exposures',
        controlStandard: 'OSHA 1926.501(b)(1)',
        mitigation: 'Guardrail systems or personal fall arrest systems (PFAS) anchored to rated structural points when working within 6 feet of leading edges or roof hatches.',
      },
      {
        hazard: 'Hot Work, Brazing & Burn Hazards',
        controlStandard: 'OSHA 1926.352',
        mitigation: 'Written hot work permit, 10-lb ABC fire extinguisher within 20 feet, non-combustible flash shields, and minimum 30-minute post-brazing fire watch.',
      },
    ],
    licensingLevels: [
      {
        tier: 'EPA 608 Universal Technician',
        requirements: 'Federal certification required under 40 CFR Part 82 to service Type I (small appliances), Type II (high-pressure), and Type III (low-pressure) commercial equipment.',
      },
      {
        tier: 'Journeyman Mechanical / HVAC Technician',
        requirements: 'Documented 4-year field apprenticeship, NATE / trade exam passage, and comprehensive duct/refrigeration code proficiency.',
      },
      {
        tier: 'Master Mechanical Contractor (Qualifying Agent)',
        requirements: 'Serves as state license qualifier; holds statutory commercial liability and workers comp policies for commercial HVAC bidding.',
      },
    ],
    crossLinkedStates: [
      {
        stateSlug: 'states/texas-contractor-requirements',
        stateName: 'Texas',
        specifics: 'TDLR Air Conditioning and Refrigeration (ACR) contractor license with Class A (unlimited) or Class B requirements.',
      },
      {
        stateSlug: 'states/california-contractor-requirements',
        stateName: 'California',
        specifics: 'CSLB Class C-20 Warm-Air Heating, Ventilating and Air-Conditioning license.',
      },
      {
        stateSlug: 'states/florida-contractor-requirements',
        stateName: 'Florida',
        specifics: 'DBPR Certified Air Conditioning Contractor (Class A or Class B) statewide license.',
      },
    ],
    faqs: [
      {
        question: 'What records must HVAC contractors maintain for EPA Section 608 audits?',
        answer: 'Contractors must maintain certified technician cards, refrigerant purchase invoices, recovery equipment certification, and service invoices showing date, refrigerant type, and pounds added/recovered for at least 3 years.',
      },
      {
        question: 'Do commercial general contractors require crane lift plans for HVAC rooftop unit replacements?',
        answer: 'Yes. Commercial GCs require a written critical lift plan whenever an RTU lift exceeds 75% of crane rated capacity, hoists over occupied buildings, or operates in high-traffic zones.',
      },
    ],
  }),

  // 18. Jurisdiction Pillar: Texas Contractor Requirements
  createStateCompliancePage({
    stateCode: 'TX',
    jurisdictionCode: 'US_TX',
    stateName: 'Texas',
    slug: 'states/texas-contractor-requirements',
    h1: 'Texas Contractor Requirements & TDLR Licensing Framework',
    metaTitle: 'Texas Contractor Requirements | Licensing, Insurance & TDLR Guide | Avorria',
    metaDescription: 'State compliance guide for contractors in Texas. TDLR licensing rules for electrical and HVAC, municipal GC permits, Workers Comp non-subscriber rules, and COI minimums.',
    intro: 'Navigating contractor compliance in the state of Texas requires understanding both statewide oversight by the Texas Department of Licensing and Regulation (TDLR) for specialty trades and municipal licensing rules enforced by major cities including Houston, Dallas, Austin, and San Antonio.',
    licensingBoard: {
      name: 'Texas Department of Licensing and Regulation',
      acronym: 'TDLR',
      url: 'https://www.tdlr.texas.gov',
      description: 'TDLR oversees mandatory statewide licensing for specialty construction trades across Texas, establishing qualifications, examinations, and insurance minimums.',
      gcRule: 'Texas does not issue a statewide General Contractor license. Instead, general building contractors are registered and permitted at the municipal and county level. However, commercial general contractors must register with city development services and verify state licenses for all subcontractors.',
      specialtyTrades: [
        {
          trade: 'Electrical',
          board: 'TDLR Electrical Division',
          details: 'Mandatory statewide Electrical Contractor (EC) and Master Electrician licensing under Texas Occupations Code Chapter 1305.',
        },
        {
          trade: 'HVAC & Refrigeration',
          board: 'TDLR Air Conditioning & Refrigeration',
          details: 'Mandatory Class A (unlimited size) or Class B (systems under 25 tons cooling / 1.5M BTU heating) ACR licenses under Chapter 1302.',
        },
        {
          trade: 'Commercial Plumbing',
          board: 'Texas State Board of Plumbing Examiners (TSBPE)',
          details: 'Mandatory Responsible Master Plumber (RMP) designation required for commercial plumbing contractors.',
        },
      ],
    },
    insuranceAndBonding: {
      generalLiability: 'TDLR mandates $300,000 per occurrence / $600,000 aggregate for specialty trades, but commercial general contractors and project owners virtually always require $1,000,000 per occurrence / $2,000,000 aggregate.',
      workersComp: 'Texas is the only state where private employers can opt out of statutory Workers’ Compensation (non-subscribers under Texas Labor Code § 406.002). However, commercial general contractors and facility developers virtually NEVER allow non-subscribers on commercial job sites.',
      suretyBonds: 'Municipalities (e.g. City of Houston, City of Dallas) require $10,000 to $25,000 contractor compliance and right-of-way performance bonds.',
      commercialCovenants: 'Standard commercial contracts require Additional Insured endorsements, Waiver of Subrogation in favor of the GC/owner, and 30-day Notice of Cancellation.',
    },
    oshaOverlay: {
      planType: 'Federal OSHA',
      agency: 'Federal OSHA Region 6 (Dallas Regional Office & Area Offices in Houston, Austin, Fort Worth, Corpus Christi, El Paso, Lubbock, and San Antonio)',
      standards: '29 CFR 1926 (Construction Safety Standards)',
      emphasisPrograms: [
        'Regional Emphasis Program (REP) for Fall Protection in Construction',
        'REP for Trenching, Excavation, and Pipeline Operations',
        'National Emphasis Program (NEP) on Outdoor Heat Illness Prevention',
      ],
    },
    crossLinkedTrades: [
      {
        tradeSlug: 'industries/electrical-contractor-compliance',
        tradeName: 'Electrical Contractor Compliance',
        relationshipNote: 'TDLR Electrical Contractor licensing, master electrician qualifier rules, and Texas-specific commercial submittals.',
      },
      {
        tradeSlug: 'industries/hvac-contractor-compliance',
        tradeName: 'HVAC & Mechanical Compliance',
        relationshipNote: 'TDLR Air Conditioning & Refrigeration (ACR) Class A/B licensing and refrigerant recovery compliance.',
      },
    ],
    faqs: [
      {
        question: 'Can an unlicensed contractor bid commercial jobs in Texas?',
        answer: 'For state-regulated trades (Electrical, HVAC, Plumbing), performing or bidding work without a valid state license is a violation of the Texas Occupations Code and subject to administrative penalties up to $5,000 per day per violation.',
      },
      {
        question: 'Can a Texas contractor operate as a workers comp non-subscriber on commercial sites?',
        answer: 'Legally under state law, yes, provided formal DWC Form-5 notice is filed. In practice for commercial work, no: general contractors strictly mandate active statutory Workers Compensation with full employer liability coverage as a condition of contract.',
      },
      {
        question: 'How do Texas contractors manage municipal licenses across multiple cities?',
        answer: 'Contractors working across Dallas, Fort Worth, Austin, and Houston maintain active municipal registrations with each city development office. Avorria consolidates municipal permit numbers and expiration dates into a single dashboard.',
      },
    ],
  }),

  // 19. Jurisdiction Pillar: California Contractor Requirements
  createStateCompliancePage({
    stateCode: 'CA',
    jurisdictionCode: 'US_CA',
    stateName: 'California',
    slug: 'states/california-contractor-requirements',
    h1: 'California Contractor License Law & CSLB Compliance Standards',
    metaTitle: 'California Contractor Requirements | CSLB Licensing & Cal/OSHA | Avorria',
    metaDescription: 'State compliance guide for contractors in California. CSLB licensing rules for Class A, B, and C trades, mandatory workers comp, Cal/OSHA Title 8, and $25,000 license bonds.',
    intro: 'California maintains one of the strictest contractor regulatory environments in the United States. Governed by the Contractors State License Board (CSLB) and the California Department of Industrial Relations, contractors must maintain strict compliance across licensing classifications, mandatory workers compensation, and Cal/OSHA Title 8 safety mandates.',
    licensingBoard: {
      name: 'California Contractors State License Board',
      acronym: 'CSLB',
      url: 'https://www.cslb.ca.gov',
      description: 'Operating under the Department of Consumer Affairs, CSLB regulates contractors in 44 classifications under California Business and Professions Code Chapter 9.',
      gcRule: 'Any commercial or residential construction project exceeding $500 in combined labor and materials requires a valid CSLB contractor license. General Building contractors hold the Class B classification.',
      specialtyTrades: [
        {
          trade: 'Electrical',
          board: 'CSLB Electrical Division',
          details: 'Class C-10 Electrical Contractor license required for all electrical work. Field electricians must also hold DLSE electrician certification.',
        },
        {
          trade: 'HVAC',
          board: 'CSLB Mechanical Division',
          details: 'Class C-20 Warm-Air Heating, Ventilating and Air-Conditioning Contractor license.',
        },
        {
          trade: 'Plumbing',
          board: 'CSLB Plumbing Division',
          details: 'Class C-36 Plumbing Contractor license required for all water, sewer, and gas piping.',
        },
      ],
    },
    insuranceAndBonding: {
      generalLiability: 'While CSLB does not mandate general liability for sole proprietorships, commercial clients mandate $1M occurrence / $2M aggregate. Commercial LLCs licensed by CSLB are legally required to carry $1M to $5M liability coverage.',
      workersComp: 'Mandatory under California Labor Code § 3700 for all contractors with 1 or more employees. C-39 Roofing, C-8 Concrete, C-20 HVAC, and C-22 Asbestos contractors MUST carry workers compensation even with zero employees.',
      suretyBonds: '$25,000 Contractor License Bond (or Cash Deposit) filed directly with CSLB is legally required for license issuance and renewal.',
      commercialCovenants: 'Mandatory preliminary 20-day notice procedures to protect mechanics lien rights under California Civil Code § 8200.',
    },
    oshaOverlay: {
      planType: 'State-Approved OSHA Plan',
      agency: 'Division of Occupational Safety and Health (Cal/OSHA)',
      standards: 'Title 8 California Code of Regulations (T8 CCR)',
      emphasisPrograms: [
        'Written Injury and Illness Prevention Program (IIPP under T8 CCR § 3203)',
        'Cal/OSHA Heat Illness Prevention Standard (T8 CCR § 3395)',
        'Respirable Crystalline Silica Standard in Construction (T8 CCR § 1532.3)',
      ],
    },
    crossLinkedTrades: [
      {
        tradeSlug: 'industries/electrical-contractor-compliance',
        tradeName: 'Electrical Contractor Compliance',
        relationshipNote: 'CSLB Class C-10 Electrical rules, certified electrician requirements, and NFPA 70E job site standards.',
      },
      {
        tradeSlug: 'industries/hvac-contractor-compliance',
        tradeName: 'HVAC & Mechanical Compliance',
        relationshipNote: 'CSLB Class C-20 requirements and mandatory workers comp without employees.',
      },
    ],
    faqs: [
      {
        question: 'What is the penalty for contracting without a license in California?',
        answer: 'Under California Business & Professions Code § 7028, contracting without a license is a misdemeanor carrying potential jail time, fines up to $15,000, and complete forfeiture of all compensation earned (disgorgement).',
      },
      {
        question: 'What is required in a Cal/OSHA written safety plan?',
        answer: 'Cal/OSHA mandates an active Injury and Illness Prevention Program (IIPP) detailing safety responsibility, compliance systems, scheduled hazard inspections, incident investigation, and documented crew training.',
      },
      {
        question: 'Do California HVAC and concrete contractors need workers comp if they have no employees?',
        answer: 'Yes. Effective under SB 216, C-8 Concrete, C-20 HVAC, C-39 Roofing, and C-22 Asbestos contractors are legally prohibited from filing a workers compensation exemption with CSLB.',
      },
    ],
  }),

  // 20. Jurisdiction Pillar: Florida Contractor Requirements
  createStateCompliancePage({
    stateCode: 'FL',
    jurisdictionCode: 'US_FL',
    stateName: 'Florida',
    slug: 'states/florida-contractor-requirements',
    h1: 'Florida Contractor Licensing, DBPR & Insurance Standards',
    metaTitle: 'Florida Contractor Requirements | DBPR CILB & Insurance Guide | Avorria',
    metaDescription: 'State compliance guide for contractors in Florida. DBPR Certified vs Registered licenses, workers compensation rules, hurricane codes, and commercial lien laws.',
    intro: 'Contractors operating in Florida face rigorous licensing and hurricane-resilient building code enforcement governed by the Florida Department of Business and Professional Regulation (DBPR) and the Florida Construction Industry Licensing Board (CILB).',
    licensingBoard: {
      name: 'Florida Department of Business and Professional Regulation - Construction Industry Licensing Board',
      acronym: 'DBPR CILB',
      url: 'https://www.myfloridalicense.com/DBPR/construction-industry/',
      description: 'Regulates commercial and residential contracting across Florida under Florida Statutes Chapter 489.',
      gcRule: 'Florida distinguishes Certified Contractors (statewide license valid in all 67 counties) and Registered Contractors (locally tested in one municipality and registered with DBPR). Certified General Contractors hold the CGC license.',
      specialtyTrades: [
        {
          trade: 'Electrical',
          board: 'Florida Electrical Contractors Licensing Board (ECLB)',
          details: 'Certified Electrical (EC) statewide license or Registered Electrical (ER) local license.',
        },
        {
          trade: 'HVAC & Mechanical',
          board: 'DBPR CILB Mechanical Division',
          details: 'Certified Air Conditioning Contractor (Class A or Class B) or Certified Mechanical Contractor (CMC).',
        },
        {
          trade: 'Plumbing',
          board: 'DBPR CILB Plumbing Division',
          details: 'Certified Plumbing Contractor (CFC) statewide license.',
        },
      ],
    },
    insuranceAndBonding: {
      generalLiability: 'DBPR requires minimum $300,000 property damage / $100,000 public liability for General Contractors, but commercial general contractors mandate $1,000,000 / $2,000,000 limits.',
      workersComp: 'Under Florida Statute § 440.02, construction businesses with 1 or more employees (including corporate officers) must carry statutory Workers Compensation. Up to 3 corporate officers with 10%+ ownership can file an exemption (DWC-250), but commercial GCs require full coverage.',
      suretyBonds: 'Financial stability bonds required if the qualifying applicant’s FICO score is below 660 ($20,000 for Division I GCs, $10,000 for Division II subcontractors).',
      commercialCovenants: 'Notice to Owner (NTO) under Florida Statute § 713.06 within 45 days of first work on commercial job sites.',
    },
    oshaOverlay: {
      planType: 'Federal OSHA',
      agency: 'Federal OSHA Region 4 (Area Offices in Tampa, Fort Lauderdale, and Jacksonville)',
      standards: '29 CFR 1926 & Florida Building Code (8th Edition 2023)',
      emphasisPrograms: [
        'Regional Emphasis Program on Fall Hazards in Construction',
        'Post-Hurricane Response & Emergency Structural Repair Safety',
        'Crane and Rigging Safety during High-Wind Weather Warnings',
      ],
    },
    crossLinkedTrades: [
      {
        tradeSlug: 'industries/electrical-contractor-compliance',
        tradeName: 'Electrical Contractor Compliance',
        relationshipNote: 'Florida ECLB Certified EC licensing, NFPA 70E electrical safety, and wind-zone surge protection requirements.',
      },
      {
        tradeSlug: 'industries/hvac-contractor-compliance',
        tradeName: 'HVAC & Mechanical Compliance',
        relationshipNote: 'Florida CILB Class A/B AC licensing, high-velocity hurricane zone (HVHZ) rooftop equipment tie-down standards.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between a Certified and Registered contractor in Florida?',
        answer: 'A Certified contractor (e.g. CGC, EC, CMC) has passed the state examination and can pull permits and bid work in any county or municipality across Florida without taking local competency tests. A Registered contractor is restricted to the specific county or city where they passed a local competency exam.',
      },
      {
        question: 'Can Florida corporate officers use a workers compensation exemption on commercial jobs?',
        answer: 'While Florida Statute Chapter 440 allows up to 3 officers to file an exemption certificate (DWC-250), commercial general contractors and project lenders almost universally require all subcontractors to have full Workers Compensation coverage covering all personnel on site.',
      },
      {
        question: 'What is Florida’s Notice to Owner (NTO) deadline?',
        answer: 'Subcontractors and suppliers without direct contract with the owner must serve a Notice to Owner within 45 days of first furnishing labor or materials to protect their mechanics lien rights under Florida Statute § 713.06.',
      },
    ],
  }),
];

/**
 * Lookup helper: find SEO page by exact slug
 */
export function getSeoPageBySlug(slug: string): SeoPageModel | undefined {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return INITIAL_SEO_PAGES.find((page) => page.slug === clean);
}

/**
 * Returns all published, indexable SEO pages for sitemap generation
 */
export function getAllIndexableSeoPages(): SeoPageModel[] {
  return INITIAL_SEO_PAGES.filter(
    (p) => p.indexStatus === 'indexable' && p.reviewStatus === 'approved_for_publication'
  );
}
