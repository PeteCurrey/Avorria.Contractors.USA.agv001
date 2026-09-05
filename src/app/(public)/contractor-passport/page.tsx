import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CinematicPageHero } from '@/components/hero/CinematicPageHero';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contractor Passport | Professional Credential Infrastructure | Avorria',
  description:
    'Your business. Your credentials. One professional Passport. Consolidate your verified licenses, insurance limits, and safety records into an auditable credential.',
  alternates: {
    canonical: `${siteConfig.url}/contractor-passport`,
  },
};

export default function ContractorPassportPage() {
  const PASSPORT_STATES = [
    {
      state: '01 / Created',
      badge: 'CREATED',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      title: 'Initial Account Setup',
      desc: 'The contractor workspace and basic business entity shell are established. Initial profile data entered but baseline documentation is not yet uploaded.',
      meaning: 'Private draft status. Not eligible for public sharing or commercial submittals.',
    },
    {
      state: '02 / Complete',
      badge: 'COMPLETE',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      title: 'All Required Evidence Uploaded',
      desc: 'The contractor has uploaded all necessary trade documents: active Certificate of Insurance (COI), state trade license number, and written safety program.',
      meaning: '100% completion of baseline checklist requirements in your private workspace.',
    },
    {
      state: '03 / Published',
      badge: 'PUBLISHED',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Active Shareable Profile',
      desc: 'The contractor has explicitly enabled external visibility. A secure, shareable public URL is generated for inclusion in bids and client pre-qualification packs.',
      meaning: 'Publicly accessible profile presenting your business data and uploaded documents.',
    },
    {
      state: '04 / Verified',
      badge: 'VERIFIED',
      badgeColor: 'bg-brand-50 text-brand-800 border-brand-300 font-bold',
      title: 'Audited Against Published Criteria',
      desc: 'Documentary evidence has been reviewed and audited against Avorria’s published verification criteria (active state registry standing, valid policy limits).',
      meaning: 'Earned audit-backed trust mark: "Verified by Avorria against published verification criteria."',
    },
  ];

  return (
    <div className="w-full bg-white text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Contractor Passport', url: `${siteConfig.url}/contractor-passport` },
      ]} />
      <CinematicPageHero
        eyebrow="THE AVORRIA CONTRACTOR PASSPORT"
        title={<>Your business. Your credentials.<br />One professional Passport.</>}
        subtitle="Eliminate disorganized PDF attachments, lost insurance certificates, and amateur email threads. The Contractor Passport organizes the verifiable facts of your business into an authoritative digital credential."
        primaryCta={{ label: 'Build Your Passport Free', href: '/sign-up' }}
        secondaryCta={{ label: 'How Verification Works', href: '/prove' }}
        backgroundImage="/images/hero-passport.jpg"
        backgroundAlt="Audited digital contractor passport credential displayed on mobile device in the field"
        pillars={[
          { title: 'Unified Digital Dossier', description: 'Consolidate active COIs, state trade licenses, safety programs, and corporate identities into one secure record.' },
          { title: 'Auditable Standing', description: 'Rigorous validation against published criteria with immutable audit trails and real-time status.' },
          { title: 'One-Click GC Sharing', description: 'Share verified credentials instantly with general contractors and project owners via secure QR link.' },
        ]}
        trustItems={['Created', 'Complete', 'Published', 'Verified']}
      />

      {/* The 4 Lifecycle States: Created → Complete → Published → Verified */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
            LIFECYCLE CLARITY
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            The Four Distinct States of a Contractor Passport
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Avorria never issues automatic or superficial verification badges. There is an explicit, transparent distinction between simply creating an account, completing your checklist, publishing your link, and earning verified status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASSPORT_STATES.map((st) => (
            <div
              key={st.state}
              className="p-6 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{st.state}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${st.badgeColor}`}>
                    {st.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-900">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-navy-900 font-medium">
                <span className="text-slate-500 block font-mono text-[10px] uppercase">Significance:</span>
                {st.meaning}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Large Passport Composition Mockup (Light) */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-brand-600">
              AUDIT-READY PRESENTATION
            </div>
            <h2 className="text-3xl font-black text-navy-900 tracking-tight">
              What Commercial Clients Receive
            </h2>
            <p className="text-sm text-slate-600">
              When you attach your Contractor Passport to a proposal, clients see a structured, evidence-backed dossier rather than marketing fluff.
            </p>
          </div>

          {/* Large Card Mockup */}
          <div className="rounded-2xl bg-white border-2 border-slate-300 shadow-xl p-8 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded font-bold uppercase">
                  Official Contractor Passport
                </span>
                <h3 className="text-3xl font-black text-navy-900 mt-2">
                  Apex Industrial Mechanical LLC
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  1000 Guadalupe St, Austin, TX 78701 • Primary NAICS: 238210 (Electrical) & 238220 (HVAC)
                </p>
              </div>
              <div className="shrink-0 text-right sm:text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-mono text-emerald-800 font-bold block">Status</span>
                <span className="text-base font-black text-emerald-700">VERIFIED</span>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">State License</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block">TX TECL #98765</span>
                <span className="text-[10px] text-emerald-700 font-medium">Active • Expires 2027</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">General Liability</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block">$2,000,000</span>
                <span className="text-[10px] text-slate-600">Travelers Casualty</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Workers’ Comp</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block">Statutory Limits</span>
                <span className="text-[10px] text-emerald-700 font-medium">Active on File</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Safety Programs</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block">OSHA 1926 Aligned</span>
                <span className="text-[10px] text-slate-600">Site-Specific HASP</span>
              </div>
            </div>

            {/* Evidence Document Package */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-navy-900">Verified Evidence Package on Record</span>
                <span className="font-mono text-[11px] text-slate-500">Updated: September 2026</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                  ✓ Certificate of Insurance PDF
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                  ✓ State TDLR Master License Copy
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                  ✓ Written Safety Manual & HAZCOM
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500 font-mono">
              Verified by Avorria against published contractor verification criteria • Permanent audit hash recorded
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
