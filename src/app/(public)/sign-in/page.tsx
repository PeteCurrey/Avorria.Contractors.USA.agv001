'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        setError('Please enter both your work email and password.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid credentials. Please verify your email and password.');
        return;
      }

      router.push(data.redirectTo || '/workspace');
      router.refresh();
    } catch {
      setError('An unexpected connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      mode="sign-in"
      eyebrow="CONTRACTOR ACCESS DESK"
      title="Welcome back"
      subtitle="Sign in to access your contractor workspace, documents, and compliance records."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-light">
            {error}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono tracking-wider uppercase text-neutral-600 font-medium">
            Work Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-3.5 py-2.5 rounded-[6px] bg-white border border-neutral-300 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all font-light"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono tracking-wider uppercase text-neutral-600 font-medium">
              Password
            </label>
            <Link
              href="/contact"
              className="text-[11px] text-[#0284c7] hover:underline font-light"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-[6px] bg-white border border-neutral-300 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all font-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-[#0284c7] focus:ring-[#0284c7]/30"
          />
          <label htmlFor="remember-me" className="text-xs font-light text-neutral-600 select-none cursor-pointer">
            Remember this device
          </label>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] bg-[#0c1322] hover:bg-[#0284c7] active:bg-[#0369a1] text-white text-sm font-light tracking-wide transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Secondary Links & Footnote */}
        <div className="pt-4 space-y-3 text-center border-t border-neutral-200/80">
          <p className="text-xs font-light text-neutral-600">
            Not yet registered with Avorria?{' '}
            <Link href="/sign-up" className="text-[#0284c7] hover:underline font-normal ml-0.5">
              Get Started Free →
            </Link>
          </p>

          <p className="text-[11px] font-extralight text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Holding an existing contractor profile? Avorria uses verified credentials — sign in with your authorized work email.
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
