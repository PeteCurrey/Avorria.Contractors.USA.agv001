import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getClientContext } from '@/lib/connect/context';
import { Logo } from '@/components/brand/Logo';
import { ShortlistProvider } from '@/components/shortlist/ShortlistContext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Client Workspace',
    template: '%s | Avorria Client',
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

const CLIENT_NAV_ITEMS = [
  { title: 'Dashboard', href: '/client', icon: '📊' },
  { title: 'Project Requests', href: '/client/requests', icon: '📋' },
  { title: 'My Contractors', href: '/client/contractors', icon: '👥' },
  { title: 'Opportunities', href: '/client/opportunities', icon: '🎯' },
  { title: 'Discover Directory', href: '/contractors', icon: '🔍' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const client = await getClientContext();

  return (
    <ShortlistProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-brand-500 selection:text-white">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/client" className="flex items-center gap-2">
                <Logo />
                <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Client Workspace
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {CLIENT_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/client/opportunities/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>+</span>
                <span>New Opportunity</span>
              </Link>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {client.profile.contact_name?.charAt(0) || 'C'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                    {client.profile.organisation_name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                    {client.profile.contact_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ShortlistProvider>
  );
}
