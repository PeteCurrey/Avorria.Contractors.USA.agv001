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
        content: 'Contractors operate in demanding environments where disorganized compliance, expired certificates of insurance, or unformatted quotes cost valuable bids. Avorria organizes your entire business operations around Business Intelligence, Professional Document Creation, Compliance Governance, Credibility Verification, and Winning Work.',
      },
      {
        heading: 'From Documentation to Public Trust',
        content: 'Unlike standalone form generators or fragmented accounting software, Avorria builds a continuous chain of credibility: from your first job hazard analysis to a fully verified digital Contractor Passport that general contractors and project owners trust.',
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
        content: 'Meet general contractor site access requirements with structured Job Hazard Analyses (JHA), Job Safety Analyses (JSA), and site-specific written safety plans formatted for instant PDF export.',
      },
      {
        heading: 'Commercial Documents That Win Bids',
        content: 'Turn site measurements and scopes of work into polished client proposals, binding quotes, and detailed change orders that protect your margins and prevent payment disputes.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'What document formats can I export?',
        answer: 'All documents can be exported as professional, high-resolution PDFs with your company branding, or shared directly via secure web links.',
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
        content: 'Losing access to a commercial job site because of an expired General Liability COI or trade license costs thousands of dollars per day. Avorria continuously monitors renewal windows and alerts your team at 60, 30, and 14-day intervals.',
      },
      {
        heading: 'Clear Compliance Categorization',
        content: 'Every policy, certificate, and permit is categorized under clear operational states: Current, Expiring Soon, Expired, Missing, or Not Applicable.',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'What types of insurance does Avorria track?',
        answer: 'Avorria tracks General Liability, Workers’ Compensation, Commercial Auto, Umbrella / Excess Liability, Inland Marine (Tools & Equipment), and Professional Liability.',
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
        content: 'Avorria does not make hollow claims or act as a government authority. Our verification status is backed by verifiable evidence: state license board lookups, active insurance certificates, and validated safety procedures.',
      },
      {
        heading: 'The Contractor Readiness Checklist',
        content: 'Contractors achieve verified status through our transparent 10-point checklist covering entity registration, tax compliance, active liability policies, and supervisory safety training.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How long does credential verification take?',
        answer: 'Most document inspections and state board registry checks are completed within 1 to 2 business days.',
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
        content: 'Your Contractor Passport displays verified business registration, current Certificates of Insurance, state license status, OSHA 10/30 certifications, and written safety program summaries in a clean, executive interface.',
      },
      {
        heading: 'Complete Control Over Your Visibility',
        content: 'Your passport is private by default. You choose when to publish, share access with specific clients, or make your profile publicly indexable to attract new project inquiries.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Can general contractors view my full documents?',
        answer: 'Yes. You can generate secure, password-protected or expiring share links that allow project managers to download pre-qualification document packs directly.',
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
        content: 'When submitting a bid, attach your Avorria Contractor Passport, active JHA, and current COI in one unified digital package. Show project owners that your business is ready for the site on day one.',
      },
      {
        heading: 'Clear Proposals that Prevent Payment Disputes',
        content: 'Use standardized scopes of work, itemized allowances, milestone billing schedules, and change order clauses that protect your cash flow and margins.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Can I customize proposal templates with my brand logo?',
        answer: 'Yes. Professional and Verified tier accounts include full brand customization, custom color palettes, and company letterhead.',
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
        content: 'OSHA standard 1926 requires employers to assess the workplace to determine if hazards are present. A thorough Job Hazard Analysis isolates high-risk activities—such as working at heights, electrical isolation, trenching, or hot work—and details specific engineering and administrative controls.',
      },
      {
        heading: 'Hierarchy of Controls Integrated Into Every Step',
        content: 'Our JHA workflow guides your team through the OSHA Hierarchy of Controls: Elimination, Substitution, Engineering Controls, Administrative Controls, and Personal Protective Equipment (PPE).',
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
        content: 'Many contractors only charge the hourly wage paid to technicians, forgetting payroll taxes (FICA, FUTA, SUTA), workers compensation insurance rates, paid time off, and field benefits. Our calculator computes full labor burden to safeguard your net margins.',
      },
      {
        heading: 'Markup vs. Margin: The Critical Difference',
        content: 'A 25% markup produces only a 20% profit margin. Misunderstanding this distinction leads to cash flow shortfalls. Avorria clarifies your gross profit margin against your target revenue.',
      },
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'What is a healthy profit margin for a trade contractor?',
        answer: 'Typical trade contractors target a net profit margin of 8% to 15% after all overhead and labor burden costs are fully absorbed.',
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
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'When should a JSA be updated?',
        answer: 'A JSA must be revised whenever work conditions change, new equipment or tools are introduced, or following an incident or near-miss.',
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
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'Does this safety plan satisfy OSHA General Duty Clause requirements?',
        answer: 'This template provides the foundational written framework required under OSHA 1926.20/21. It must be filled out with site-specific hazard assessments and competent person details.',
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
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How often should contractors conduct toolbox talks?',
        answer: 'Best practice on commercial job sites is weekly, or at the start of any new high-risk phase (such as crane lifts or trenching).',
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
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'How do proposal terms prevent scope creep?',
        answer: 'Our template includes explicit "Clarifications and Exclusions" clauses, stipulating that any work outside the defined scope requires an executed change order.',
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
    ],
    schemaType: 'SoftwareApplication',
    faqs: [
      {
        question: 'When should a change order be executed?',
        answer: 'A change order should always be signed by both the contractor and project owner BEFORE the additional work is initiated.',
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
        content: 'General Liability ($1M occurrence / $2M aggregate minimum), statutory Workers’ Compensation, Commercial Auto Liability ($1M combined single limit), and Umbrella Liability where required by tier-1 GCs.',
      },
      {
        heading: '3. State Trade Licensing & Bonding',
        content: 'Active license in your specific trade category with qualifying party designated. Surety bonds verified where mandated by state licensing statutes.',
      },
      {
        heading: '4. OSHA Safety Standards & Training Records',
        content: 'Written Safety Program, active site Hazard Communication (SDS binder), documented competent persons, and OSHA 10/30-hour training cards for crew leaders.',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'Who enforces contractor compliance?',
        answer: 'Compliance is enforced by state licensing boards (e.g. CSLB in California, TDLR in Texas), federal OSHA compliance officers, insurance underwriters, and general contractor safety managers.',
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
  {
    slug: 'industries/electrical-contractor-compliance',
    pageType: 'trade_pillar',
    searchIntent: 'trade',
    title: 'Electrical Contractor Compliance, Safety & JHA Requirements',
    h1: 'Electrical Contractor Safety & Compliance Standards',
    metaTitle: 'Electrical Contractor Compliance | NFPA 70E, OSHA & JHA Guide | Avorria',
    metaDescription: 'Essential compliance requirements for electrical contractors. Arc flash safety, NFPA 70E standards, OSHA lockout/tagout (LOTO), and trade license management.',
    intro: 'Electrical contracting carries some of the highest job site risks. Complying with NFPA 70E, OSHA 1926 Subpart K, and master electrician licensing standards is mandatory for commercial work.',
    bodySections: [
      {
        heading: 'Arc Flash Hazard Assessments & NFPA 70E',
        content: 'Working on energized equipment requires calculated arc flash risk evaluations, calibrated PPE categories (Category 1 through 4), and written energized electrical work permits.',
      },
      {
        heading: 'Lockout / Tagout (LOTO) Compliance',
        content: 'Zero energy verification under OSHA 1910.147 / 1926.417 is non-negotiable. Every electrical JHA must document specific isolation points, tag numbers, and multi-meter testing protocols.',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'When is an electrical contractor required to have a written safety plan?',
        answer: 'General contractors and commercial clients require a written safety plan for any electrical sub undertaking work over $10,000 or on any project with energized switchgear.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Industries', item: '/industries' },
      { name: 'Electrical', item: '/industries/electrical-contractor-compliance' },
    ],
    primaryCta: {
      title: 'Generate an Electrical JHA in Seconds',
      description: 'Pre-configured with NFPA 70E arc flash and LOTO safety controls.',
      buttonText: 'Create Electrical JHA',
      href: '/sign-up?trade=electrical',
    },
    relatedPages: [
      { title: 'JHA Generator', slug: 'tools/job-hazard-analysis-jha-generator', description: 'Create task hazard analysis.', type: 'interactive_tool' },
      { title: 'Contractor Passport', slug: 'contractor-passport', description: 'Showcase verified master electrician credentials.', type: 'contractor_passport' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria Trade Engineering Panel',
    source: 'NFPA 70E & OSHA 1926 Subpart K',
    tradeSlug: 'electrical',
    topic: 'electrical',
  },

  // 17. Jurisdiction Pillar: Texas Contractor Requirements
  {
    slug: 'states/texas-contractor-requirements',
    pageType: 'jurisdiction_pillar',
    searchIntent: 'geographic',
    title: 'Texas Contractor Licensing, Insurance & Compliance Guide',
    h1: 'Texas Contractor Requirements & Compliance Overview',
    metaTitle: 'Texas Contractor Requirements | Licensing, Insurance & TDLR Guide | Avorria',
    metaDescription: 'State compliance guide for contractors in Texas. Learn licensing rules from TDLR, municipality permits, workers comp options, and general liability minimums.',
    intro: 'Navigating contractor compliance in the state of Texas requires understanding both statewide TDLR oversight for specialty trades and municipal licensing rules in major metropolitan areas.',
    bodySections: [
      {
        heading: 'Statewide vs. Municipal Licensing in Texas',
        content: 'While Texas does not issue a single statewide "General Contractor" license, specialty trades—including Electrical (TDLR), HVAC/Refrigeration (TDLR), and Plumbing (TSBPE)—require mandatory state licenses. General contractors are licensed at the city and county level (e.g. City of Houston, City of Dallas, Austin).',
      },
      {
        heading: 'Workers’ Compensation in Texas: The Non-Subscriber Rule',
        content: 'Texas is the only state where private employers can opt out of statutory Workers’ Compensation (non-subscribers). However, commercial general contractors virtually ALWAYS require valid Workers’ Comp coverage as a strict condition of contract.',
      },
    ],
    schemaType: 'Article',
    faqs: [
      {
        question: 'Can an unlicensed contractor bid commercial jobs in Texas?',
        answer: 'For state-regulated trades (Electrical, HVAC, Plumbing), performing work without a valid state license is a violation of the Texas Occupations Code and subject to administrative penalties.',
      },
    ],
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'States', item: '/states' },
      { name: 'Texas', item: '/states/texas-contractor-requirements' },
    ],
    primaryCta: {
      title: 'Managing Projects in Texas?',
      description: 'Track TDLR license renewals and Texas municipal insurance certificates in one place.',
      buttonText: 'Manage Texas Compliance',
      href: '/sign-up?state=TX',
    },
    relatedPages: [
      { title: 'Contractor Compliance Checklist', slug: 'guides/contractor-compliance-checklist', description: 'Federal and multi-state compliance checklist.', type: 'compliance_guide' },
      { title: 'Electrical Contractor Compliance', slug: 'industries/electrical-contractor-compliance', description: 'Electrical safety and TDLR alignment.', type: 'trade_pillar' },
    ],
    indexStatus: 'indexable',
    reviewStatus: 'approved_for_publication',
    publishedAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    author: 'Avorria State Regulatory Desk',
    source: 'Texas Department of Licensing and Regulation (TDLR)',
    sourceUrl: 'https://www.tdlr.texas.gov',
    jurisdictionCode: 'US_TX',
    topic: 'texas',
  },
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
