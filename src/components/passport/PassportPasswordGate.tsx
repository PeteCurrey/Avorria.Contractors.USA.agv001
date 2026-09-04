'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PassportPasswordGate({ slug, orgName }: { slug: string; orgName: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/workspace/passport/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect access password.');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 border border-slate-800 bg-[#090d16] text-center space-y-4">
      <div className="w-10 h-10 border border-slate-700 bg-[#030712] flex items-center justify-center mx-auto text-amber-400 font-mono text-sm">
        🔒
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Password Protected Passport
        </h2>
        <p className="text-xs text-slate-400">
          {orgName} has restricted access to this commercial verification passport. Enter the password provided to view credentials.
        </p>
      </div>

      {error && (
        <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter access password"
          className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={isVerifying}
          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50"
        >
          {isVerifying ? 'Verifying...' : 'Unlock Passport →'}
        </button>
      </form>
    </div>
  );
}
