'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Organization, WorkspaceUser, WorkspaceNotification } from '@/lib/workspace/types';

interface WorkspaceShellProps {
  organization: Organization;
  user: WorkspaceUser;
  notifications: WorkspaceNotification[];
  unreadCount: number;
  children: React.ReactNode;
}

// ─── Top Icon-Strip Navigation ──────────────────────────────────
// Reference: SBB rail-logistics operator top icon-strip
const PRIMARY_ICON_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'DASHBOARD',
    href: '/workspace',
    exact: true,
    // Control center / layout grid icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'comply',
    label: 'Comply',
    shortLabel: 'COMPLIANCE',
    href: '/workspace/comply',
    // Shield / check badge icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    id: 'prove',
    label: 'Prove & Passport',
    shortLabel: 'PASSPORT',
    href: '/workspace/prove',
    // Passport / credential card icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.364a4.125 4.125 0 00-6.338 0 .375.375 0 01-.256.111h6.85a.375.375 0 01-.256-.111z" />
      </svg>
    ),
  },
  {
    id: 'create',
    label: 'Create Documents',
    shortLabel: 'GENERATOR',
    href: '/workspace/create',
    // Document creation / pencil icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    id: 'assets',
    label: 'Fleet & Assets',
    shortLabel: 'FLEET & ASSETS',
    href: '/workspace/assets',
    // Truck / heavy equipment icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V14.25m0 0h3.75m-3.75 0H2.25" />
      </svg>
    ),
  },
  {
    id: 'win-work',
    label: 'Win Work Pipeline',
    shortLabel: 'WIN WORK',
    href: '/workspace/win-work',
    // Target / contract radar icon
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.143 2.143L15 7.5" />
      </svg>
    ),
  },
];

const SECONDARY_WORKSPACE_LINKS = [
  { label: 'Document Vault', href: '/workspace/documents' },
  { label: 'Contractor Passport', href: '/workspace/passport' },
  { label: 'Verification Desk', href: '/workspace/verification' },
  { label: 'Equipment & Safety', href: '/workspace/assets' },
  { label: 'Company Settings', href: '/workspace/settings' },
];

export function WorkspaceShell({
  organization,
  user,
  notifications,
  unreadCount: initialUnreadCount,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const [unread, setUnread] = useState(initialUnreadCount);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function markAllNotificationsRead() {
    try {
      await fetch('/api/workspace/notifications', { method: 'PATCH' });
      setNotifs(notifs.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch {
      // Ignored
    }
  }

  function isNavActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const userInitials = (user.full_name || 'Operator')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="workspace-theme min-h-screen bg-[#ECEEEF] text-[#111827] flex flex-col font-sans antialiased">
      {/* ── SBB OPERATOR TOP NAVIGATION BAR ────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#ECEEEF]/90 backdrop-blur-md border-b border-[#E2E4E8] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Facility */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/workspace" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-[10px] bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs group-hover:bg-neutral-800 transition-colors">
              AV
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-neutral-900">
                  AVORRIA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" title="Operator Platform" />
              </div>
              <div className="micro-label text-[9px] truncate max-w-[160px]">
                {organization.name}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: SBB Icon-Strip Navigation (Icon-Only + Accessible Hover Tooltips) */}
        <nav
          aria-label="Operator Navigation Strip"
          className="hidden md:flex items-center bg-white/90 border border-[#E2E4E8] p-1 rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        >
          {PRIMARY_ICON_NAV.map((item) => {
            const active = isNavActive(item.href, item.exact);
            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`w-9 h-9 rounded-[11px] flex items-center justify-center transition-all duration-150 relative ${
                    active
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80'
                  }`}
                >
                  {item.icon}

                  {/* Single orange accent dot on active nav button */}
                  {active && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#F97316]" />
                  )}
                </Link>

                {/* Accessible Tooltip on Hover */}
                <div
                  role="tooltip"
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-md"
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right: SBB User Block ("Stewart Menzies / Operator") + Notification */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#E2E4E8] text-neutral-600 hover:text-neutral-900"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Notifications button with Orange Accent Dot */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl bg-white border border-[#E2E4E8] text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors shadow-2xs"
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E4E8] rounded-2xl shadow-xl z-50 p-3 overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E4E8]">
                  <span className="micro-label">NOTIFICATIONS ({notifs.length})</span>
                  {unread > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-mono text-[#F97316] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {notifs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400">
                      Zero unread alerts.
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs ${
                          n.read_at ? 'text-neutral-500 bg-neutral-50' : 'text-neutral-900 bg-[#FFF7ED] border border-orange-200'
                        }`}
                      >
                        <div className="micro-label text-[9px] mb-1">
                          {n.type.replace(/_/g, ' ')}
                        </div>
                        <div className="leading-snug">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Block: "Stewart Menzies / Operator" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 bg-white border border-[#E2E4E8] hover:border-neutral-300 py-1 pl-1.5 pr-3 rounded-2xl transition-colors shadow-2xs group text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block min-w-0 pr-0.5">
                <div className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[130px]">
                  {user.full_name}
                </div>
                <div className="micro-label text-[9px] text-neutral-400 leading-none mt-0.5">
                  {user.role || 'Operator'}
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E4E8] rounded-2xl shadow-xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-[#E2E4E8] mb-1">
                  <div className="font-semibold text-neutral-900">{user.full_name}</div>
                  <div className="text-neutral-400 font-mono text-[11px] truncate">{user.email || ''}</div>
                </div>
                <Link
                  href="/workspace/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700"
                >
                  Facility Settings
                </Link>
                <Link
                  href="/workspace/passport"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700"
                >
                  Contractor Passport
                </Link>
                <Link
                  href="/"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-500"
                >
                  Public Marketing Site ↗
                </Link>
                <div className="border-t border-[#E2E4E8] mt-1 pt-1">
                  <Link
                    href="/sign-in"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600"
                  >
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E4E8] px-4 py-4 space-y-3 z-30">
          <div className="micro-label">OPERATOR NAVIGATION</div>
          <div className="grid grid-cols-2 gap-2">
            {PRIMARY_ICON_NAV.map((item) => {
              const active = isNavActive(item.href, item.exact);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    active
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-2 border-t border-[#E2E4E8] flex flex-wrap gap-2 text-[11px]">
            {SECONDARY_WORKSPACE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT WORKSPACE AREA ────────────────────────── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
