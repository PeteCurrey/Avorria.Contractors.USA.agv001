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

const PRIMARY_NAV = [
  {
    label: 'OVERVIEW',
    href: '/workspace',
    exact: true,
  },
  {
    label: 'BUSINESS',
    href: '/workspace/settings',
  },
  {
    label: 'CREATE',
    href: '/workspace/create',
  },
  {
    label: 'COMPLY',
    href: '/workspace/comply',
  },
  {
    label: 'PROVE',
    href: '/workspace/prove',
  },
  {
    label: 'PASSPORT',
    href: '/workspace/passport',
  },
  {
    label: 'VERIFICATION',
    href: '/workspace/verification',
  },
  {
    label: 'WIN WORK',
    href: '/workspace/win-work',
  },
  {
    label: 'DOCUMENTS',
    href: '/workspace/documents',
  },
  {
    label: 'ASSETS',
    href: '/workspace/assets',
  },
  {
    label: 'TEAM',
    href: '/workspace/team',
  },
];

const SECONDARY_NAV = [
  {
    label: 'SETTINGS',
    href: '/workspace/settings',
  },
  {
    label: 'HELP',
    href: '/help',
  },
];

function getHour(): number {
  return new Date().getHours();
}

function getGreeting(): string {
  const h = getHour();
  if (h < 12) return 'GOOD MORNING';
  if (h < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

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

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    // BUSINESS → settings: treat specially since SETTINGS also links there
    if (href === '/workspace/settings') return false; // avoid double-highlight; handled below
    return pathname.startsWith(href);
  }

  // Special: highlight BUSINESS when on settings, highlight SETTINGS only when
  // we're on settings and came from the secondary nav context (not possible to distinguish,
  // so we just highlight both — acceptable UX)
  function isNavActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const locationStr = [
    organization.hq_address?.city,
    organization.hq_address?.state,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
        {/* Logo / Brand */}
        <div>
          <div className="px-5 py-4 border-b border-slate-100">
            <Link href="/workspace" className="block">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-brand-600 inline-block" />
                <span className="text-[10px] font-mono font-bold text-brand-600 tracking-[0.15em] uppercase">
                  AVORRIA
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                CONTRACTOR WORKSPACE
              </div>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav className="py-3" aria-label="Primary navigation">
            <div className="px-4 pb-1 pt-2 text-[9px] font-mono uppercase tracking-[0.15em] text-slate-400">
              WORKSPACE
            </div>
            {PRIMARY_NAV.map((item) => {
              const active = isNavActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors ${
                    active
                      ? 'text-brand-700 bg-brand-50 border-l-2 border-brand-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l-2 border-transparent'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation + User */}
        <div>
          <nav className="py-2 border-t border-slate-100" aria-label="Secondary navigation">
            {SECONDARY_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-[11px] font-mono tracking-[0.08em] transition-colors ${
                    active && item.href !== '/help'
                      ? 'text-slate-700 bg-slate-50 border-l-2 border-slate-300 font-bold'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border-l-2 border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User panel */}
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-700 truncate">{user.full_name}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {user.role}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP COMMAND BAR */}
        <header className="border-b border-slate-200 bg-white shrink-0">
          <div className="px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
            {/* Left — Greeting + Location */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle navigation"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="hidden md:block min-w-0">
                <div className="text-[10px] font-mono font-bold tracking-[0.12em] text-slate-800">
                  {getGreeting()},{' '}
                  <span className="text-brand-600">{organization.name.toUpperCase()}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                  {locationStr ? `${locationStr} · ` : ''}CONTRACTOR WORKSPACE
                </div>
              </div>

              {/* Mobile: just org name */}
              <div className="md:hidden text-[11px] font-mono font-bold text-slate-800 truncate">
                {organization.name}
              </div>
            </div>

            {/* Right — Search / Notifications / Account */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                type="button"
                className="hidden sm:flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
                aria-label="Search workspace"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="square"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden lg:inline">SEARCH</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="square"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-mono font-bold text-[8px] px-1 py-0 leading-tight min-w-[14px] text-center">
                      {unread}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-slate-200 shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                        NOTIFICATIONS ({notifs.length})
                      </span>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-mono text-brand-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="text-center py-8 text-[11px] font-mono text-slate-400">
                          No notifications.
                        </div>
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-slate-100 text-xs ${
                              n.read_at
                                ? 'text-slate-500'
                                : 'text-slate-800 bg-blue-50/50'
                            }`}
                          >
                            <div className="text-[9px] font-mono uppercase text-slate-400 mb-0.5">
                              {new Date(n.sent_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              · {n.type.replace(/_/g, ' ')}
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
                  className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-mono text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                >
                  <span className="hidden sm:inline font-semibold">{user.full_name}</span>
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-[11px] font-bold text-slate-800">{user.full_name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {user.email ?? 'No email set'}
                      </div>
                    </div>
                    <Link
                      href="/workspace/settings"
                      className="block px-4 py-2 text-[11px] font-mono text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ACCOUNT SETTINGS
                    </Link>
                    <Link
                      href="/sign-in"
                      className="block px-4 py-2 text-[11px] font-mono text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      SIGN OUT
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 py-3 shadow-sm">
            <nav className="px-4 space-y-0.5" aria-label="Mobile navigation">
              {PRIMARY_NAV.map((item) => {
                const active = isNavActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`block px-3 py-2 text-[11px] font-mono tracking-[0.08em] ${
                      active
                        ? 'text-brand-700 bg-brand-50 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-slate-100 mt-2 pt-2">
                {SECONDARY_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 text-[11px] font-mono text-slate-400 hover:text-slate-700"
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
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
