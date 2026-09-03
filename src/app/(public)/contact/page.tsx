import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

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
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="primary" size="md">GET IN TOUCH</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Contact Our Team
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Questions about platform features, pre-qualification workflows, or enterprise contractor accounts? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-7">
          <Card variant="default">
            <form className="space-y-4 text-left">
              <Input label="Your Name" placeholder="Marcus Vance" required />
              <Input label="Company Name" placeholder="Apex Electrical Solutions LLC" required />
              <Input label="Business Email" type="email" placeholder="owner@company.com" required />
              <Select
                label="Primary Trade"
                options={[
                  { value: 'electrical', label: 'Electrical Contractor' },
                  { value: 'hvac', label: 'HVAC & Mechanical' },
                  { value: 'plumbing', label: 'Commercial Plumbing' },
                  { value: 'roofing', label: 'Commercial Roofing' },
                  { value: 'gc', label: 'General Contracting' },
                  { value: 'other', label: 'Other Specialty Trade' },
                ]}
              />
              <Textarea
                label="Message or Inquiry"
                placeholder="How can our team help your business?"
                rows={4}
                required
              />
              <Button type="button" size="md" variant="primary" className="w-full">
                Send Message
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact Information Sidebar */}
        <div className="md:col-span-5 space-y-6 text-xs text-slate-300 text-left">
          <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
            <h3 className="font-bold text-white text-sm">Customer Support</h3>
            <p className="text-slate-400">Available Monday through Friday, 8:00 AM – 6:00 PM CST.</p>
            <div className="pt-2 font-mono text-brand-400">{siteConfig.supportEmail}</div>
          </div>

          <div className="p-5 rounded-lg bg-surface-card border border-surface-border space-y-2">
            <h3 className="font-bold text-white text-sm">Commercial Partnerships</h3>
            <p className="text-slate-400">For general contractor pre-qualification partnerships or carrier integrations.</p>
            <div className="pt-2 font-mono text-brand-400">{siteConfig.contactEmail}</div>
          </div>

          <div className="p-5 rounded-lg bg-surface-subtle border border-surface-border space-y-1.5 text-slate-400">
            <h3 className="font-bold text-white text-sm">Headquarters</h3>
            <p>Avorria Technologies Inc.</p>
            <p>Austin, Texas, United States</p>
          </div>
        </div>
      </div>
    </div>
  );
}
