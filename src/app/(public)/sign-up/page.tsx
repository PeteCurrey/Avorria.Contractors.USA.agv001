'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';

export default function SignUpPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize onboarding step 1 with company name and email
      await fetch('/api/contractor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          data: {
            businessName: companyName,
            email,
          },
        }),
      });

      router.push('/app/onboarding');
    } catch {
      router.push('/app/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      mode="sign-up"
      eyebrow="CONTRACTOR REGISTRATION"
      title="Create your account"
      subtitle="Set up your Avorria account and start building your verified contractor profile."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-light">
            {error}
          </div>
        )}

        {/* Company Name Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono tracking-wider uppercase text-neutral-600 font-medium">
            Company / Trade Business Name
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Apex Electrical Solutions LLC"
            className="w-full px-3.5 py-2.5 rounded-[6px] bg-white border border-neutral-300 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all font-light"
          />
        </div>

        {/* Business Email Field */}
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
            placeholder="owner@company.com"
            className="w-full px-3.5 py-2.5 rounded-[6px] bg-white border border-neutral-300 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all font-light"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono tracking-wider uppercase text-neutral-600 font-medium">
            Create Secure Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono tracking-wider uppercase text-neutral-600 font-medium">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-[6px] bg-white border border-neutral-300 text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all font-light"
          />
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-[#0284c7] focus:ring-[#0284c7]/30"
          />
          <label htmlFor="agree-terms" className="text-xs font-light text-neutral-600 select-none cursor-pointer leading-tight">
            I agree to the{' '}
            <Link href="/terms" className="text-[#0284c7] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#0284c7] hover:underline">
              Privacy Policy
            </Link>
            .
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
                <span>Creating account...</span>
              </span>
            ) : (
              <>
                <span>Create Account & Start Onboarding</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Secondary Links & Footnote */}
        <div className="pt-4 space-y-3 text-center border-t border-neutral-200/80">
          <p className="text-xs font-light text-neutral-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#0284c7] hover:underline font-normal ml-0.5">
              Sign In →
            </Link>
          </p>

          <p className="text-[11px] font-extralight text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Free Starter Tier • No Credit Card Required • Immediate Workspace Access
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
