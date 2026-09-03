import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'About Avorria | Professional Contractor Infrastructure',
  description:
    'Learn about Avorria’s mission to build the professional operating, documentation, and credibility platform for American trade contractors.',
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">OUR MISSION</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Serious Software for Serious Contractors
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Avorria was founded on a simple observation: trade contractors do some of the most skilled, high-risk work in America, yet the industry’s documentation and pre-qualification software has remained fragmented, clunky, and outdated.
        </p>
      </div>

      {/* Narrative Body */}
      <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
        <p>
          Too many good contractors lose lucrative commercial bids not because of their craftsmanship, but because their pre-qualification paperwork looks disorganized or an insurance certificate expired without anyone noticing.
        </p>
        <p>
          We built Avorria to provide the <strong>professional infrastructure</strong> that contractors need: structured tools to create site-specific Job Hazard Analyses and safety programs, automated tracking for Certificates of Insurance and state licenses, and a verifiable <strong>Contractor Passport</strong> that commercial clients can trust.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <CardTitle className="text-base">Preparedness</CardTitle>
          <CardDescription className="text-xs mt-2">
            No last-minute panic when site safety inspectors walk on site. Every crew member, JHA, and policy is documented and ready.
          </CardDescription>
        </Card>

        <Card variant="default">
          <CardTitle className="text-base">Credibility</CardTitle>
          <CardDescription className="text-xs mt-2">
            Evidence-backed credentials. We don’t make hollow claims; we help contractors prove their legitimacy with verified documentation.
          </CardDescription>
        </Card>

        <Card variant="default">
          <CardTitle className="text-base">Operational Quality</CardTitle>
          <CardDescription className="text-xs mt-2">
            Professional proposals and quotes that reflect the true caliber of your contracting firm and protect your bottom line.
          </CardDescription>
        </Card>
      </div>

      {/* CTA */}
      <section className="text-center space-y-4 pt-6">
        <h2 className="text-2xl font-bold text-white">Join Avorria Today</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Take the first step toward professional contractor infrastructure.
        </p>
        <Button href="/sign-up" size="lg" variant="primary">
          Start Free Account
        </Button>
      </section>
    </div>
  );
}
