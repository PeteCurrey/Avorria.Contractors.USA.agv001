'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceUser, WorkspaceUserRole } from '@/lib/workspace/types';

interface TeamClientProps {
  organization: Organization;
  currentUser: WorkspaceUser;
  initialMembers: WorkspaceUser[];
}

export function TeamClient({ organization: _org, currentUser, initialMembers }: TeamClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<WorkspaceUser[]>(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<WorkspaceUserRole>('office_staff');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = currentUser.role === 'owner' || currentUser.role === 'admin';

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/workspace/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite team member');

      setMembers((prev) => [...prev, data.member]);
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {canManage ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            + Invite Team Member
          </button>
        ) : (
          <div />
        )}

        <span className="text-xs font-mono text-slate-400">
          TOTAL TEAM MEMBERS: {members.length}
        </span>
      </div>

      <div className="border border-slate-800 bg-[#090d16]">
        <div className="divide-y divide-slate-800 text-xs font-mono">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#090d16] hover:bg-slate-900/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm font-sans">{member.full_name}</span>
                  <span
                    className={`px-2 py-0.5 text-[9px] uppercase border ${
                      member.role === 'owner'
                        ? 'border-sky-500/40 text-sky-300 bg-sky-950/20'
                        : member.role === 'admin'
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20'
                        : 'border-slate-700 text-slate-400 bg-slate-900'
                    }`}
                  >
                    {member.role.replace(/_/g, ' ')}
                  </span>
                  {member.id === currentUser.id && (
                    <span className="text-[10px] text-slate-500 font-mono">(You)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {member.email || 'No email registered'}{' '}
                  {member.phone ? `• ${member.phone}` : ''}
                </div>
              </div>

              <div className="text-slate-500 text-[10px]">
                JOINED: {new Date(member.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#090d16] border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Invite Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Full Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Email Address <span className="text-sky-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.jenkins@company.com"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(512) 555-0199"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Role Assignment <span className="text-sky-400">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as WorkspaceUserRole)}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="office_staff">Office Staff (Documents & Quotes)</option>
                  <option value="field">Field Crew (Toolbox Talks & JHA Viewer)</option>
                </select>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Only the account creator holds the permanent Organization Owner role.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
