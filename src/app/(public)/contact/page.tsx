import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { ContactFormClient } from './ContactFormClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Avorria | Support & Commercial Inquiries',
  description:
    'Contact the Avorria team for platform support, enterprise contractor pre-qualification inquiries, or partnership discussions.',
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-page py-16 px-4 sm:px-6 lg:px-8 text-navy-800">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Contact', url: `${siteConfig.url}/contact` },
      ]} />
      <div className="max-w-5xl mx-auto space-y-12 text-left">
        {/* Header */}
        <div className="space-y-4 max-w-2xl border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-brand-50 border border-brand-200 text-brand-700 font-mono text-xs font-medium">
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extralight text-navy-900 tracking-tight leading-tight">
            Contact Our Team
          </h1>
          <p className="text-base text-slate-600 font-extralight leading-relaxed">
            Questions about platform capabilities, contractor pre-qualification workflows, or enterprise contractor accounts? Our operations team is ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form Component */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
              <ContactFormClient />
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-brand-700 font-medium">
                Customer Support
              </div>
              <h3 className="text-base font-light text-navy-900">Contractor Assistance</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                Available Monday through Friday, 8:00 AM – 6:00 PM CST for operational help with documents, COIs, and passport settings.
              </p>
              <div className="pt-2">
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="font-mono text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {siteConfig.supportEmail}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-brand-700 font-medium">
                Commercial Partnerships
              </div>
              <h3 className="text-base font-light text-navy-900">General Contractor & Carrier Inquiries</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-extralight">
                For commercial general contractors sourcing pre-qualified subcontractors or insurance brokerage integration inquiries.
              </p>
              <div className="pt-2">
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="font-mono text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600 font-extralight">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">
                Corporate Entity
              </div>
              <div className="font-normal text-navy-900 text-sm">{siteConfig.legalName}</div>
              <p>Austin, Texas, United States</p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                US-First Professional Contractor Infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
