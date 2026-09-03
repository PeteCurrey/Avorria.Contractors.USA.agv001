import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { getPassportDetails } from '@/lib/tenant/repository';
import { Badge } from '@/components/ui/Badge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { Card, CardTitle } from '@/components/ui/Card';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Check demo or live repository
  let companyName = 'Contractor Profile';
  let isPublished = false;

  if (slug === 'apex-electrical-solutions') {
    companyName = 'Apex Electrical Solutions LLC';
    isPublished = true;
  } else {
    try {
      const orgId = slug.startsWith('contractor-') ? `${slug.replace('contractor-', '')}-aaaa-aaaa-aaaa-aaaaaaaaaaaa` : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const passport = await getPassportDetails(orgId);
      if (passport.isPublished) {
        companyName = passport.workspace.organisation.name;
        isPublished = true;
      }
    } catch {
      isPublished = false;
    }
  }

  if (!isPublished) {
    return {
      title: 'Profile Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${companyName} | Contractor Passport`,
    description: `Public contractor credentials and readiness record for ${companyName}.`,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteConfig.url}/contractors/${slug}`,
    },
  };
}

export default async function ContractorProfilePage({ params }: Props) {
  const { slug } = await params;

  let companyName = '';
  let tradeName = 'Commercial Electrical';
  let location = 'Austin, TX';
  let score = 92;
  let isPublished = false;
  let checks: { label: string; satisfied: boolean }[] = [];

  if (slug === 'apex-electrical-solutions') {
    companyName = 'Apex Electrical Solutions LLC';
    tradeName = 'Commercial Electrical Contractor';
    location = 'Austin, TX';
    score = 95;
    isPublished = true;
    checks = [
      { label: 'Active General Liability Insurance ($2M Aggregate)', satisfied: true },
      { label: 'State Trade License (Texas TDLR #34891)', satisfied: true },
      { label: 'Written Safety Program (OSHA 1926 Aligned)', satisfied: true },
      { label: 'Supervisors with OSHA 30 Cards', satisfied: true },
    ];
  } else {
    try {
      const orgId = slug.startsWith('contractor-') ? `${slug.replace('contractor-', '')}-aaaa-aaaa-aaaa-aaaaaaaaaaaa` : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const passport = await getPassportDetails(orgId);
      if (passport.isPublished) {
        companyName = passport.workspace.organisation.name;
        tradeName = passport.workspace.trades.map((t) => t.replace('-', ' ')).join(', ');
        location = `${passport.workspace.serviceAreas.cities[0] || 'Austin'}, ${passport.workspace.serviceAreas.primaryState}`;
        score = passport.readiness.score;
        isPublished = true;
        checks = passport.checks;
      }
    } catch {
      isPublished = false;
    }
  }

  // STRICT PRIVACY GATE: Only published passports are visible
  if (!isPublished) {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-left">
      {/* Header Profile Card */}
      <Card variant="elevated" className="border-brand-500/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Public Contractor Passport</Badge>
              <Badge variant="neutral" size="sm">Live Client View</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{companyName}</h1>
            <p className="text-xs text-slate-300">
              {tradeName} • {location}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <ReadinessGauge score={score} size="md" showLabel />
          </div>
        </div>

        {/* Verified Credentials List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Verified Contractor Credentials & Evidence
          </div>

          <div className="space-y-2 text-xs">
            {checks.map((chk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <span className={chk.satisfied ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                    {chk.satisfied ? '✓' : '•'}
                  </span>
                  <span>{chk.label}</span>
                </div>
                <Badge variant={chk.satisfied ? 'current' : 'missing'} size="sm">
                  {chk.satisfied ? 'Verified on File' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Regulatory Notice */}
      <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs text-slate-500 space-y-1 text-center">
        <span>Contractor Passport verified against Avorria operational prequalification checklist criteria.</span>
      </div>
    </div>
  );
}
