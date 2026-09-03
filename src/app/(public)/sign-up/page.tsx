'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignUpPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="py-16 px-4 max-w-md mx-auto space-y-6 text-left">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Start with {siteConfig.name}
        </h1>
        <p className="text-xs text-slate-400">
          Build your professional contractor identity, generate JHAs, and manage compliance.
        </p>
      </div>

      <Card variant="default">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Company Name"
            placeholder="Apex Electrical Solutions LLC"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <Input
            label="Business Email"
            type="email"
            placeholder="owner@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Create Secure Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full text-center" isLoading={isLoading}>
              Create Account & Start Onboarding →
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            Free Starter Tier • No Credit Card Required
          </p>
        </form>

        <div className="text-center pt-4 mt-4 border-t border-surface-border text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-brand-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
