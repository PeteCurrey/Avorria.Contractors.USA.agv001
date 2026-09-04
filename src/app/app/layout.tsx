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
      { title: 'Dashboard', href: '/app/dashboard', icon: '📊' },
      { title: 'Contractor Passport', href: '/app/passport', icon: '🛡️' },
      { title: 'Verification', href: '/app/verification', icon: '✓' },
    ],
  },
  {
    category: 'NETWORK & OPPORTUNITIES',
    items: [
      { title: 'Project Requests', href: '/contractor/requests', icon: '📬' },
      { title: 'Project Opportunities', href: '/contractor/opportunities', icon: '🎯' },
      { title: 'Client Relationships', href: '/contractor/relationships', icon: '🤝' },
    ],
  },
  {
    category: 'DOCUMENTS & CREATION',
    items: [
      { title: 'Document Vault', href: '/app/documents', icon: '📄' },
      { title: 'JHA / JSA Generator', href: '/app/documents/create/jha', icon: '⚡' },
      { title: 'Quotes & Estimates', href: '/app/quotes', icon: '💰' },
      { title: 'Proposals & Bids', href: '/app/proposals', icon: '📋' },
    ],
  },
  {
    category: 'COMPLIANCE & WORKFORCE',
    items: [
      { title: 'Compliance & COIs', href: '/app/compliance', icon: '⚠️' },
      { title: 'Ask Avorria', href: '/app/compliance#ask-avorria', icon: '💬' },
      { title: 'People & OSHA Training', href: '/app/people', icon: '👷' },
      { title: 'Equipment & Safety', href: '/app/equipment', icon: '🚜' },
    ],
  },
  {
    category: 'ORGANIZATION',
    items: [
      { title: 'Business Profile', href: '/app/business', icon: '🏢' },
      { title: 'Onboarding Setup', href: '/app/onboarding', icon: '🚀' },
      { title: 'Billing & Plan', href: '/app/billing', icon: '💳' },
      { title: 'Notifications', href: '/app/notifications', icon: '🔔' },
      { title: 'Settings', href: '/app/settings', icon: '⚙️' },
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
    <div className="dark min-h-screen bg-surface-base flex text-slate-200">
      {/* Sidebar Shell */}
      <aside className="w-64 border-r border-surface-border bg-surface-subtle flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Org / App Brand Header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-white tracking-tight">
              <span className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center font-black text-white text-xs">
                AV
              </span>
              <span>{siteConfig.name}</span>
            </Link>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-slate-400 border border-surface-border">
              APP
            </span>
          </div>

          {/* Dynamic Tenant Org Identifier */}
          <div className="p-3 mx-3 my-3 rounded bg-surface-card border border-surface-border">
            <div className="text-[10px] uppercase font-mono text-slate-500">Active Tenant</div>
            <div className="text-xs font-bold text-white truncate">{tenantName}</div>
            <div
              className={`text-[10px] font-medium ${
                isAssessmentPending ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {readinessLabel}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6" aria-label="Application Navigation">
            {APP_NAV_SECTIONS.map((sec) => (
              <div key={sec.category} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {sec.category}
                </div>
                <div className="space-y-0.5">
                  {sec.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Footer / Return to Public */}
        <div className="p-4 border-t border-surface-border text-xs text-slate-500 flex items-center justify-between">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            ← Public Website
          </Link>
          <span className="font-mono text-[10px]">v0.3 Core</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Bar */}
        <header className="h-14 border-b border-surface-border bg-surface-subtle flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Contractor Workspace • US Federal & State Framework
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/app/notifications" className="text-slate-400 hover:text-white">
              🔔 Alerts
            </Link>
            <Link href="/app/settings" className="text-slate-400 hover:text-white">
              ⚙️ Settings
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
