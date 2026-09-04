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

// ─── Navigation structure ───────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Overview',      href: '/workspace',             exact: true },
      { label: 'Comply',        href: '/workspace/comply' },
      { label: 'Win Work',      href: '/workspace/win-work' },
    ],
  },
  {
    label: 'Documents',
    items: [
      { label: 'Create',        href: '/workspace/create' },
      { label: 'Documents',     href: '/workspace/documents' },
      { label: 'Assets',        href: '/workspace/assets' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { label: 'Prove',         href: '/workspace/prove' },
      { label: 'Passport',      href: '/workspace/passport' },
      { label: 'Verification',  href: '/workspace/verification' },
      { label: 'Team',          href: '/workspace/team' },
    ],
  },
];

const SECONDARY_NAV = [
  { label: 'Settings', href: '/workspace/settings' },
  { label: 'Help',     href: '/help' },
];

// ─── SVG icons ──────────────────────────────────────────────────
function IconMenu() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeWidth="1.75" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeWidth="1.75"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // Determine current section label for the header breadcrumb
  function getCurrentSectionLabel(): string {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          return item.label;
        }
      }
    }
    for (const item of SECONDARY_NAV) {
      if (pathname.startsWith(item.href)) return item.label;
    }
    return 'Overview';
  }

  const sectionLabel = getCurrentSectionLabel();
  const locationStr = [organization.hq_address?.city, organization.hq_address?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col min-h-0">
          {/* Brand */}
          <div className="px-4 pt-5 pb-4 border-b border-slate-100">
            <Link href="/workspace" className="block group">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-brand-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-900 tracking-tight">
                  Avorria
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider pl-3.5">
                Contractor Workspace
              </div>
            </Link>
          </div>

          {/* Primary nav */}
          <nav className="flex-1 py-4 overflow-y-auto" aria-label="Primary navigation">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="px-4 mb-1 text-[9px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = isNavActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center pl-4 pr-3 py-1.5 text-[12px] transition-colors ${
                        active
                          ? 'text-slate-900 font-semibold bg-slate-50 border-l-2 border-brand-600'
                          : 'text-slate-500 font-normal hover:text-slate-800 hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100">
          <nav aria-label="Secondary navigation">
            {SECONDARY_NAV.map((item) => {
              const active = pathname.startsWith(item.href) && item.href !== '/help';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center pl-4 pr-3 py-2 text-[11px] transition-colors border-l-2 ${
                    active
                      ? 'text-slate-700 border-slate-300 bg-slate-50'
                      : 'text-slate-400 border-transparent hover:text-slate-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="text-[11px] font-medium text-slate-700 truncate">{user.full_name}</div>
            <div className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP COMMAND BAR */}
        <header className="border-b border-slate-200 bg-white shrink-0 z-30">
          <div className="px-5 sm:px-7 h-12 flex items-center justify-between gap-4">

            {/* Left — breadcrumb + org context */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle navigation"
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? <IconClose /> : <IconMenu />}
              </button>

              <div className="min-w-0">
                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-700 truncate max-w-[160px]">
                    {organization.name}
                  </span>
                  <span aria-hidden="true">/</span>
                  <span className="text-slate-500">{sectionLabel}</span>
                  {locationStr && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-slate-400 hidden lg:inline">{locationStr}</span>
                    </>
                  )}
                </div>
                {/* Mobile: org name only */}
                <div className="md:hidden text-[12px] font-medium text-slate-800 truncate max-w-[180px]">
                  {organization.name}
                </div>
              </div>
            </div>

            {/* Right — notifications + account */}
            <div className="flex items-center gap-1">

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                >
                  <IconBell />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-slate-200 shadow-lg z-50 rounded">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700">
                        Notifications {notifs.length > 0 && <span className="text-slate-400 font-normal">({notifs.length})</span>}
                      </span>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifs.length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-slate-400">
                          No notifications.
                        </div>
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 text-[12px] ${
                              n.read_at ? 'text-slate-500' : 'text-slate-800 bg-brand-50/40'
                            }`}
                          >
                            <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
                              {new Date(n.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' · '}{n.type.replace(/_/g, ' ')}
                            </div>
                            <div className="leading-snug">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Account menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                >
                  <span className="hidden sm:inline font-medium truncate max-w-[120px]">{user.full_name}</span>
                  <IconChevronDown />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-lg z-50 rounded">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-[12px] font-semibold text-slate-800 truncate">{user.full_name}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{user.email ?? ''}</div>
                    </div>
                    <Link
                      href="/workspace/settings"
                      className="flex items-center gap-2 px-4 py-2 text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Account settings
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-4 py-2 text-[12px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Public site
                      <IconExternalLink />
                    </Link>
                    <div className="border-t border-slate-100">
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-2 px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign out
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-sm z-20">
            <nav className="px-4 py-3 space-y-4" aria-label="Mobile navigation">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="mb-1 text-[9px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-1">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const active = isNavActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center px-2 py-2 text-[12px] rounded transition-colors ${
                          active
                            ? 'text-slate-900 font-semibold bg-slate-100'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3">
                {SECONDARY_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center px-2 py-2 text-[11px] text-slate-400 hover:text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
