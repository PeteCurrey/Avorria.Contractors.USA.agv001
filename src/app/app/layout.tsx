import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

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
    category: 'DOCUMENTS & CREATION',
    items: [
      { title: 'Documents (JHA/JSA)', href: '/app/documents', icon: '📄' },
      { title: 'Quotes & Estimates', href: '/app/quotes', icon: '💰' },
      { title: 'Proposals & Bids', href: '/app/proposals', icon: '📋' },
    ],
  },
  {
    category: 'COMPLIANCE & WORKFORCE',
    items: [
      { title: 'Compliance & COIs', href: '/app/compliance', icon: '⚠️' },
      { title: 'People & OSHA Training', href: '/app/people', icon: '👷' },
      { title: 'Equipment & Safety', href: '/app/equipment', icon: '🚜' },
    ],
  },
  {
    category: 'ORGANIZATION',
    items: [
      { title: 'Business Profile', href: '/app/business', icon: '🏢' },
      { title: 'Billing & Plan', href: '/app/billing', icon: '💳' },
      { title: 'Notifications', href: '/app/notifications', icon: '🔔' },
      { title: 'Settings', href: '/app/settings', icon: '⚙️' },
    ],
  },
];

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-base flex text-slate-200">
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

          {/* Tenant Org Identifier */}
          <div className="p-3 mx-3 my-3 rounded bg-surface-card border border-surface-border">
            <div className="text-[10px] uppercase font-mono text-slate-500">Active Tenant</div>
            <div className="text-xs font-bold text-white truncate">Apex Electrical Solutions LLC</div>
            <div className="text-[10px] text-emerald-400 font-medium">95% Readiness Score</div>
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
          <span className="text-[10px] font-mono text-slate-600">v0.1.0</span>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-surface-border bg-surface-subtle/50 px-6 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-400">
            Avorria Contractor Workspace <span className="text-slate-600">/</span> Multi-Tenant Mode
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app/passport"
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
            >
              <span>View Passport</span>
            </Link>
            <div className="w-7 h-7 rounded-full bg-brand-900 border border-brand-700 flex items-center justify-center text-xs font-bold text-brand-300">
              CO
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
