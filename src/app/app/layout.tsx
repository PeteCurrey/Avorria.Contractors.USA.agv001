import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { getTenantContext } from '@/lib/tenant/context';
import { getEvaluatedWorkspace } from '@/lib/tenant/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Contractor Workspace',
    template: `%s | ${siteConfig.name} Workspace`,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const APP_NAV_SECTIONS = [
  {
    category: 'OVERVIEW',
    items: [
      { title: 'Dashboard', href: '/app/dashboard' },
      { title: 'Contractor Passport', href: '/app/passport' },
      { title: 'Verification', href: '/app/verification' },
    ],
  },
  {
    category: 'NETWORK & OPPORTUNITIES',
    items: [
      { title: 'Project Requests', href: '/contractor/requests' },
      { title: 'Project Opportunities', href: '/contractor/opportunities' },
      { title: 'Client Relationships', href: '/contractor/relationships' },
    ],
  },
  {
    category: 'DOCUMENTS & CREATION',
    items: [
      { title: 'Document Vault', href: '/app/documents' },
      { title: 'JHA / JSA Generator', href: '/app/documents/create/jha' },
      { title: 'Quotes & Estimates', href: '/app/quotes' },
      { title: 'Proposals & Bids', href: '/app/proposals' },
    ],
  },
  {
    category: 'COMPLIANCE & WORKFORCE',
    items: [
      { title: 'Compliance & COIs', href: '/app/compliance' },
      { title: 'Ask Avorria', href: '/app/compliance#ask-avorria' },
      { title: 'People & OSHA Training', href: '/app/people' },
      { title: 'Equipment & Safety', href: '/app/equipment' },
    ],
  },
  {
    category: 'ORGANIZATION',
    items: [
      { title: 'Business Profile', href: '/app/business' },
      { title: 'Onboarding Setup', href: '/app/onboarding' },
      { title: 'Billing & Plan', href: '/app/billing' },
      { title: 'Notifications', href: '/app/notifications' },
      { title: 'Settings', href: '/app/settings' },
    ],
  },
];

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tenantName = 'My Contracting Business';
  let readinessLabel = 'Assessment in progress';
  let isAssessmentPending = true;

  try {
    const tenant = await getTenantContext();
    const { workspace, readiness } = await getEvaluatedWorkspace(tenant.organisation.id);
    tenantName = workspace.organisation.name || tenantName;
    readinessLabel = readiness.label;
    isAssessmentPending = readiness.status === 'assessment_in_progress';
  } catch (err) {
    console.error('Failed to load tenant in app shell layout', err);
  }

  return (
    <div className="dark min-h-screen bg-surface-base flex text-slate-200 antialiased font-sans">
      {/* Sidebar Shell */}
      <aside className="w-60 border-r border-surface-border bg-surface-subtle flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Org / App Brand Header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <Link href="/app/dashboard" className="flex items-center gap-2 font-semibold text-white tracking-tight">
              <span className="w-6 h-6 rounded-[3px] bg-brand-600 flex items-center justify-center font-bold text-white text-[11px]">
                AV
              </span>
              <span className="text-sm font-medium">{siteConfig.name}</span>
            </Link>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] bg-surface-elevated text-slate-400 border border-surface-border uppercase">
              PORTAL
            </span>
          </div>

          {/* Dynamic Tenant Org Identifier */}
          <div className="p-3 mx-3 my-3 rounded-[4px] bg-surface-card border border-surface-border">
            <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Active Tenant</div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">{tenantName}</div>
            <div
              className={`text-[10px] font-mono font-medium mt-1 flex items-center gap-1.5 ${
                isAssessmentPending ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAssessmentPending ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{readinessLabel}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-5" aria-label="Application Navigation">
            {APP_NAV_SECTIONS.map((sec) => (
              <div key={sec.category} className="space-y-1">
                <div className="px-2.5 text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                  {sec.category}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-xs font-normal text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer / Return to Public */}
        <div className="p-3.5 border-t border-surface-border text-xs text-slate-500 flex items-center justify-between">
          <Link href="/" className="hover:text-slate-300 transition-colors text-[11px]">
            ← Public Website
          </Link>
          <span className="font-mono text-[9px] text-slate-600">v0.3 Core</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Bar */}
        <header className="h-12 border-b border-surface-border bg-surface-subtle flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Contractor Workspace</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">US Federal & State Framework</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/app/notifications" className="text-slate-400 hover:text-white transition-colors">
              Alerts
            </Link>
            <Link href="/app/settings" className="text-slate-400 hover:text-white transition-colors">
              Settings
            </Link>
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
