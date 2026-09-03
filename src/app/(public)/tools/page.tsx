import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Interactive Contractor Tools & Safety Generators | Avorria',
  description:
    'Free interactive tools for US commercial and trade contractors: Job Hazard Analysis (JHA) generator, contractor quote calculator, and safety plan builders.',
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
};

const TOOLS = [
  {
    title: 'Job Hazard Analysis (JHA) Generator',
    slug: 'tools/job-hazard-analysis-jha-generator',
    category: 'Safety & OSHA',
    description: 'Step-by-step interactive tool to identify workplace hazards, assign OSHA control measures, and generate job-ready PDF summaries.',
    badge: 'Popular Tool',
    actionText: 'Launch JHA Generator',
  },
  {
    title: 'Contractor Quote & Margin Calculator',
    slug: 'tools/contractor-quote-calculator',
    category: 'Estimating & Finance',
    description: 'Calculate real labor burden, direct materials, equipment rental, overhead markup, and target profit margins to prevent underbidding.',
    badge: 'Estimating',
    actionText: 'Calculate Margins',
  },
  {
    title: 'Contractor Compliance Checklist Tool',
    slug: 'guides/contractor-compliance-checklist',
    category: 'Compliance & Audit',
    description: '30-point interactive evaluation covering business entity registration, COI requirements, state trade licensing, and OSHA rules.',
    badge: 'Compliance',
    actionText: 'Open Checklist',
  },
  {
    title: 'Job Safety Analysis (JSA) Builder',
    slug: 'templates/job-safety-analysis-jsa',
    category: 'Safety & Training',
    description: 'Structured 3-column field hazard analysis designed for daily crew briefings and site safety meetings.',
    badge: 'Field Safety',
    actionText: 'View JSA Builder',
  },
  {
    title: 'Site Safety Plan (HASP) Generator',
    slug: 'templates/construction-safety-plan',
    category: 'Commercial Pre-qual',
    description: 'Build a site-specific written health and safety manual required for commercial project pre-qualification.',
    badge: 'Site Manual',
    actionText: 'View Safety Plan',
  },
  {
    title: 'Toolbox Talk Meeting Log Builder',
    slug: 'templates/toolbox-talk',
    category: 'Workforce Training',
    description: 'Document ongoing safety training meetings with signed crew attendance rosters to satisfy OSHA audit standards.',
    badge: 'Training Log',
    actionText: 'View Toolbox Talk',
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" size="md">UTILITIES & GENERATORS</Badge>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Interactive Contractor Tools
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Field-tested digital utilities engineered for American trade contractors. Calculate bid margins, assess safety hazards, and generate compliant documentation.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <Card key={tool.slug} variant="interactive" className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-brand-400 font-semibold">{tool.category}</span>
                <Badge variant="neutral" size="sm">{tool.badge}</Badge>
              </div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription className="text-xs">{tool.description}</CardDescription>
            </div>
            <div className="pt-6">
              <Button href={`/${tool.slug}`} size="sm" variant="outline" className="w-full">
                {tool.actionText} →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Conversion Banner */}
      <section className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white">Need to Save & Organize Your Documents?</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Create a free Avorria contractor account to save generated documents to your cloud workspace, add custom company branding, and track insurance expiration dates.
        </p>
        <Button href="/sign-up" size="md" variant="primary">
          Start Free Account
        </Button>
      </section>
    </div>
  );
}
