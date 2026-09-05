import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { ProductHero } from '@/components/hero/ProductHero';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'COI Tracking Software & Contractor License Tracking | Avorria Comply',
  description:
    "Automated COI tracking software built for trade contractors. Track certificates of insurance, state trade licenses, workers' comp mandates, and job-site readiness in one platform.",
  alternates: {
    canonical: `${siteConfig.url}/comply`,
  },
  openGraph: {
    title: 'COI Tracking Software & Contractor License Tracking | Avorria Comply',
    description:
      "Automated COI tracking software built for trade contractors. Track certificates of insurance, state trade licenses, workers' comp mandates, and job-site readiness in one platform.",
    url: `${siteConfig.url}/comply`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COI Tracking Software & Contractor License Tracking | Avorria Comply',
    description:
      "Automated COI tracking software built for trade contractors. Track certificates of insurance, state trade licenses, workers' comp mandates, and job-site readiness in one platform.",
  },
};

export default function ComplyPage() {
  const CONTEXT_TIERS = [
    {
      title: '01 / Statutory & Regulatory Requirements',
      desc: 'Mandatory statutory laws enforced by federal and state government authorities. Non-compliance risks legal penalties or license forfeiture.',
      examples: [
        'OSHA 1926 & 1910 workplace safety standards & mandatory reporting',
        'State licensing board minimums (e.g. Texas TDLR, California CSLB, Florida DBPR)',
        'State-mandated statutory Workers’ Compensation coverage',
        'Local municipal building codes and trade permits',
      ],
    },
    {
      title: '02 / Recognized Industry Standards',
      desc: 'Technical codes and safety consensus standards established by engineering and safety bodies representing trade craftsmanship best practices.',
      examples: [
        'NFPA 70 / National Electrical Code (NEC) & NFPA 70E Arc Flash rules',
        'ASHRAE refrigeration standards and Sheet Metal (SMACNA) guidelines',
        'AISC structural steel erection standards and American Welding Society (AWS) D1.1',
        'International Plumbing Code (IPC) and Uniform Mechanical Code (UMC)',
      ],
    },
    {
      title: '03 / Commercial Client Covenants',
      desc: 'Contractual insurance limits, safety certifications, and pre-qualification covenants demanded by general contractors, lenders, and facility owners.',
      examples: [
        'Commercial General Liability endorsements naming GC as Additional Insured',
        'Per-Project Aggregate limits and Primary & Non-Contributory wording',
        'Mandatory OSHA 30-Hour supervisor cards for on-site foremen',
        'Subcontractor pre-qualification submission deadlines prior to mobilization',
      ],
    },
    {
      title: '04 / Avorria Platform Readiness Criteria',
      desc: 'Structured software evaluation measuring completeness, timeliness, and evidence documentation within your internal Avorria workspace.',
      examples: [
        'Contractor Readiness Score (0–100%) dynamically calculated across 9 core categories',
        'Proactive renewal notification timelines at 60, 30, and 14 days prior to expiration',
        'Document verification audit trails and historical version immutability',
        'Published Contractor Passport readiness for immediate commercial sharing',
      ],
    },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Comply', item: '/comply' },
        ]}
      />
      <ProductHero
        eyebrow="PILLAR 03 / COMPLIANCE & READINESS"
        title={<>COI tracking software &<br />contractor compliance.</>}
        subtitle="Automated COI tracking software built for trade contractors. Organize your business records by distinguishing legal statutory mandates, trade engineering standards, client certificate of insurance tracking requirements, and internal platform readiness."
        primaryCta={{ label: 'Start Tracking Compliance Free', href: '/sign-up' }}
        secondaryCta={{ label: 'View Compliance Checklist', href: '/guides/contractor-compliance-checklist' }}
        pillars={[
          { title: 'Certificate of Insurance Tracking', description: 'Monitor COI expiry, occurrence limits, aggregate coverage, and endorsement status in one place.' },
          { title: 'Trade License Monitoring', description: 'Track state licensing board status, designated qualifying parties, and renewal windows across jurisdictions.' },
          { title: 'Readiness Score & Alerts', description: 'Dynamic readiness score across 9 core categories with automated 60, 30, and 14-day renewal alerts.' },
        ]}
        trustItems={['COI Tracking', 'License Monitoring', 'OSHA Alignment', 'Readiness Score', 'Renewal Alerts']}
      />

      {/* Contextual Compliance Framework (Light Theme) */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
            CONTEXTUAL CLARITY
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            Understanding the Four Layers of Contractor Compliance
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Avorria makes it unmistakably clear: we do not declare universal statutory compliance for your business. Instead, we structure your evidence across distinct operational boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CONTEXT_TIERS.map((tier) => (
            <div
              key={tier.title}
              className="p-8 rounded-lg bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-navy-900">{tier.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tier.desc}</p>
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Typical Scope:
                  </span>
                  <ul className="space-y-1.5 text-xs text-navy-800">
                    {tier.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand-600 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory Disclaimer Box */}
        <div className="p-6 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2 leading-relaxed">
          <strong className="block text-sm font-bold text-amber-900">
            Statutory Legal & Regulatory Boundary Notice
          </strong>
          <p>
            Avorria is an operational software provider. Avorria is not a law firm, government regulatory authority, state contractor licensing board, or workers’ compensation insurance underwriter. Contractors are independently responsible for confirming statutory and regulatory requirements within their specific operating jurisdictions.
          </p>
        </div>
      </section>
    </div>
  );
}
