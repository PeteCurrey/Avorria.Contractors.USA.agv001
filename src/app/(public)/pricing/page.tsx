import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  SoftwareApplicationJsonLd,
} from '@/components/seo/JsonLd';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';
import { PricingPageClient } from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Transparent Pricing Plans for Contractors | Avorria',
  description:
    'Predictable, transparent pricing for trade contractors and growing commercial builders. From our Free Starter tier to Verified Contractor and Business suites.',
  alternates: {
    canonical: `${siteConfig.url}/pricing`,
  },
  openGraph: {
    title: 'Transparent Pricing Plans for Contractors | Avorria',
    description:
      'Predictable, transparent pricing for trade contractors and growing commercial builders. Compare Free Starter, Professional, Verified Contractor, and Business tiers.',
    url: `${siteConfig.url}/pricing`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transparent Pricing Plans for Contractors | Avorria',
    description:
      'Predictable, transparent pricing for trade contractors and growing commercial builders. Compare Free Starter, Professional, Verified Contractor, and Business tiers.',
  },
};

const PRICING_FAQS = [
  {
    question: 'Can I start on the Free Starter plan and upgrade later?',
    answer:
      'Yes. You can start completely free, generate required safety forms like JHAs and JSAs, and upgrade to Professional or Verified when you need site-specific safety plans, automated expiration alerts, or verified Contractor Passport sharing.',
  },
  {
    question: 'What is required for the Verified Contractor plan?',
    answer:
      'The Verified tier includes review of your uploaded Certificate of Insurance against minimum commercial coverage limits, confirmation of active standing on state licensing board registries, and safety documentation audit to unlock the verified badge.',
  },
  {
    question: 'Are payments and billing data secure?',
    answer:
      'Paid subscription billing is currently in final integration and will be processed through an industry-standard, PCI-compliant payment processor. We will never store card numbers on our own servers. During the current beta phase, paid plan activation is handled manually — contact us to get started.',
  },
  {
    question: 'Does Avorria issue government contractor licenses?',
    answer:
      'No. Avorria is a private software platform and contractor operating infrastructure. We provide tools to organize, structure, and verify the credentials issued by state licensing boards and licensed insurance carriers.',
  },
];

const TRUST_ITEMS = [
  'Cancel Anytime',
  '30-Day Guarantee',
  'No Setup Fees',
  'Commercial Pre-Qual Ready',
  'Enterprise Data Isolation',
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-surface-page text-navy-800">
      {/* Schema.org Structured Data */}
      <SoftwareApplicationJsonLd
        name="Avorria Contractor Operating & Compliance Platform"
        description="Unified software platform for trade contractors: OSHA compliance documentation, automated COI tracking, and verified contractor passport prequalification."
        url={`${siteConfig.url}/pricing`}
      />
      <FaqJsonLd faqs={PRICING_FAQS} />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Pricing', item: '/pricing' },
        ]}
      />

      {/* ── CINEMATIC FULL-SCREEN PRICING HERO ── */}
      <CinematicPageHero
        eyebrow="TRANSPARENT COMMERCIAL PRICING"
        title={<>Transparent pricing for<br />serious contractors.</>}
        subtitle="From independent specialty trades generating their first JHA to growing multi-crew firms managing commercial pre-qualification dossiers."
        primaryCta={{ label: 'View Pricing Plans', href: '#plans' }}
        secondaryCta={{ label: 'Explore Platform', href: '/platform' }}
        backgroundImage="/images/hero-pricing.jpg"
        backgroundAlt="Commercial trade contractors and estimating team reviewing project bids and contractor operating platform"
        pillars={[
          { title: 'Free Starter Access', description: 'Zero barrier to entry. Create unlimited single-use JHAs, JSAs, and daily reports at no cost.' },
          { title: 'Predictable Monthly Rates', description: 'No hidden setup fees, surprise per-seat penalties, or convoluted enterprise contracts.' },
          { title: 'Commercial ROI', description: 'Win higher margin subcontracts with instant pre-qualification packs and verified credentials.' },
        ]}
      />

      {/* ── PRICING PLANS & BILLING TOGGLE ── */}
      <section id="plans" className="bg-surface-page py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-10 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
              Select Your Tier
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
              Simple, transparent contractor tiers.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
              Choose the right operational capability for your business size and client requirements.
            </p>
          </div>

          <PricingPageClient trustItems={TRUST_ITEMS} />
        </div>
      </section>

      {/* Corporate FAQ & Transparency Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-brand-600 uppercase tracking-widest font-semibold">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-navy-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {PRICING_FAQS.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="font-bold text-navy-900 text-base">{faq.question}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Footer Anchor */}
      <section className="bg-[#070c18] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Start building your contractor operating system today.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            No credit card required for the Free Starter plan. Generate compliant documentation in minutes.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button href="/sign-up" size="lg" variant="primary">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
