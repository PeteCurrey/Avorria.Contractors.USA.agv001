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

  async function markAllNotificationsRead() {
    try {
      await fetch('/api/workspace/notifications', { method: 'PATCH' });
      setNotifs(notifs.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch {
      // Ignored
    }
  }

  const navItems = [
    { label: 'Dashboard', href: '/workspace', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Comply', href: '/workspace/comply', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Prove (Passport)', href: '/workspace/prove', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2' },
    { label: 'Create (AI Docs)', href: '/workspace/create', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { label: 'Assets', href: '/workspace/assets', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: 'Documents', href: '/workspace/documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Team', href: '/workspace/team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Settings', href: '/workspace/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex font-sans antialiased">
      {/* ── LEFT SIDEBAR (SHARP ZERO-RADIUS) ── */}
      <aside className="w-64 bg-[#090d16] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Logo / Org Header */}
          <div className="p-5 border-b border-slate-800">
            <Link href="/workspace" className="block space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-sky-500 inline-block" />
                <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  AVORRIA WORKSPACE
                </span>
              </div>
              <div className="font-sans text-sm font-bold text-slate-200 truncate">
                {organization.name}
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                {organization.primary_trade} • {organization.states_licensed.join(', ') || 'USA'}
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              OPERATING PILLARS
            </div>

            {navItems.map((item) => {
              const isActive =
                item.href === '/workspace'
                  ? pathname === '/workspace'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-[#111c30] border-sky-500/50 text-sky-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </nav>
        </div>

        {/* Bottom User Info */}
        <div className="p-4 border-t border-slate-800 bg-[#060a14] flex items-center justify-between text-xs">
          <div className="truncate">
            <div className="font-bold text-slate-200 truncate">{user.full_name}</div>
            <div className="text-[10px] font-mono text-slate-500 capitalize">{user.role}</div>
          </div>
          <Link
            href="/workspace/settings"
            className="text-slate-400 hover:text-white p-1 text-sm font-mono"
            title="Settings"
          >
            ⚙
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-14 border-b border-slate-800 bg-[#090d16] px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Title */}
            <div className="md:hidden font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sky-500 inline-block" />
              <span>{organization.name}</span>
            </div>

            {/* Org Switcher indicator */}
            <div className="hidden md:flex items-center gap-2 border border-slate-800 bg-[#030712] px-3 py-1.5 text-xs font-mono">
              <span className="text-slate-500">ORG:</span>
              <span className="text-slate-200 font-bold">{organization.name}</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 uppercase ml-1">
                {organization.subscription_tier}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-[#030712] transition-colors"
                title="Notifications"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-mono font-bold text-[9px] px-1 py-0 leading-tight">
                    {unread}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#090d16] border border-slate-700 shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold uppercase text-slate-200">
                      Notifications ({notifs.length})
                    </span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[10px] font-mono text-sky-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {notifs.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 font-mono">
                        No notifications.
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs border ${
                            n.read_at ? 'border-slate-800/60 bg-[#030712]/50 text-slate-400' : 'border-amber-500/40 bg-amber-950/10 text-slate-200 font-medium'
                          }`}
                        >
                          <div className="text-[10px] font-mono uppercase text-slate-500">
                            {new Date(n.sent_at).toLocaleDateString()} • {n.type.replace(/_/g, ' ')}
                          </div>
                          <div className="mt-1 leading-snug">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 border border-slate-800 bg-[#030712] px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                <span className="font-medium">{user.full_name}</span>
                <span className="font-mono text-[10px] text-slate-500">▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#090d16] border border-slate-700 shadow-2xl z-50 p-2 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-bold text-white">{user.full_name}</div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">{user.email || 'No email set'}</div>
                  </div>
                  <Link
                    href="/workspace/settings"
                    className="block px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/sign-in"
                    className="block px-3 py-1.5 text-rose-400 hover:bg-slate-800 hover:text-rose-300"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
