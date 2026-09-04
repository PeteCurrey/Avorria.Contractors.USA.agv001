'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRIMARY_TRADES } from '@/lib/workspace/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Company Basics
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [entityType, setEntityType] = useState('LLC');
  const [ein, setEin] = useState('');
  const [primaryTrade, setPrimaryTrade] = useState<string>(PRIMARY_TRADES[0]);
  const [statesOfOperation, setStatesOfOperation] = useState('TX');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Step 2: Insurance (Deferrable)
  const [glCarrier, setGlCarrier] = useState('');
  const [glPolicyNumber, setGlPolicyNumber] = useState('');
  const [glCoverageAmount, setGlCoverageAmount] = useState('1000000');
  const [glExpirationDate, setGlExpirationDate] = useState('');

  const [wcCarrier, setWcCarrier] = useState('');
  const [wcPolicyNumber, setWcPolicyNumber] = useState('');
  const [wcCoverageAmount, setWcCoverageAmount] = useState('500000');
  const [wcExpirationDate, setWcExpirationDate] = useState('');

  // Step 3: Licensing (Deferrable)
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issuingBoard, setIssuingBoard] = useState('');
  const [licenseState, setLicenseState] = useState('TX');
  const [licenseExpirationDate, setLicenseExpirationDate] = useState('');

  // Step 4: Team Invites (Optional)
  const [teamInvites, setTeamInvites] = useState<{ email: string; role: 'office_staff' | 'field' }[]>([
    { email: '', role: 'office_staff' },
  ]);

  function addTeamRow() {
    setTeamInvites([...teamInvites, { email: '', role: 'office_staff' }]);
  }

  function updateTeamRow(index: number, field: 'email' | 'role', val: string) {
    const next = [...teamInvites];
    if (field === 'email') next[index].email = val;
    if (field === 'role') next[index].role = val as 'office_staff' | 'field';
    setTeamInvites(next);
  }

  async function handleFinish() {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      companyName: companyName.trim() || 'My Contracting Business',
      legalName: legalName.trim() || companyName.trim() || 'My Contracting Business',
      entityType,
      ein: ein.trim() || undefined,
      primaryTrade,
      statesOfOperation: statesOfOperation.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
      userFullName: userFullName.trim() || 'Workspace Owner',
      userEmail: userEmail.trim() || undefined,
      insurance: {
        glCarrier: glCarrier.trim() || undefined,
        glPolicyNumber: glPolicyNumber.trim() || undefined,
        glCoverageAmount: glCoverageAmount ? Number(glCoverageAmount) : undefined,
        glExpirationDate: glExpirationDate || undefined,
        wcCarrier: wcCarrier.trim() || undefined,
        wcPolicyNumber: wcPolicyNumber.trim() || undefined,
        wcCoverageAmount: wcCoverageAmount ? Number(wcCoverageAmount) : undefined,
        wcExpirationDate: wcExpirationDate || undefined,
      },
      licensing: {
        licenseNumber: licenseNumber.trim() || undefined,
        issuingBoard: issuingBoard.trim() || undefined,
        state: licenseState,
        expirationDate: licenseExpirationDate || undefined,
      },
      teamInvites: teamInvites.filter((t) => t.email.trim().length > 0),
    };

    try {
      const res = await fetch('/api/workspace/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding setup');
      }

      router.push('/workspace');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Onboarding error');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-6 pt-6 sm:pt-12">
        {/* Progress Bar & Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-wider">
            <span>AVORRIA WORKSPACE ONBOARDING</span>
            <span>STEP {step} OF 4</span>
          </div>

          <div className="w-full bg-slate-900 border border-slate-800 h-1.5 flex">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {step === 1 && 'Company Basics & Operating Profile'}
              {step === 2 && 'Commercial Insurance (Deferrable)'}
              {step === 3 && 'State Trade Licensing (Deferrable)'}
              {step === 4 && 'Team Invitations & Access (Optional)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {step === 1 && 'Set your legal business structure and primary trade taxonomy.'}
              {step === 2 && 'Record your active policies. You can skip any field and add it later in the workspace.'}
              {step === 3 && 'Add state trade licenses and board numbers. Every field can be completed later.'}
              {step === 4 && 'Invite office and field personnel. You remain the sole organization owner.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-3 text-xs font-mono">
            Error: {error}
          </div>
        )}

        {/* Form Container — Sharp Zero-Radius */}
        <div className="border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-6">
          {/* STEP 1: COMPANY BASICS */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                  Company Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Vance Commercial Electric LLC"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Legal name on filings"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Entity Type
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  >
                    <option value="LLC">LLC (Limited Liability Company)</option>
                    <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Primary Trade <span className="text-sky-400">*</span>
                  </label>
                  <select
                    value={primaryTrade}
                    onChange={(e) => setPrimaryTrade(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  >
                    {PRIMARY_TRADES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    States of Operation
                  </label>
                  <input
                    type="text"
                    value={statesOfOperation}
                    onChange={(e) => setStatesOfOperation(e.target.value)}
                    placeholder="e.g. TX, OK, LA"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Federal EIN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={ein}
                    onChange={(e) => setEin(e.target.value)}
                    placeholder="XX-XXXXXXX (Encrypted at rest)"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INSURANCE (DEFERRABLE) */}
          {step === 2 && (
            <div className="space-y-6 text-xs">
              <div className="border-l-2 border-sky-500 pl-3 py-1 bg-sky-950/20 text-sky-200">
                Every field in this section is optional. You can skip now and upload your COI PDF directly inside the Comply matrix.
              </div>

              {/* General Liability */}
              <div className="space-y-3">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  1. General Liability COI
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Insurance Carrier</label>
                    <input
                      type="text"
                      value={glCarrier}
                      onChange={(e) => setGlCarrier(e.target.value)}
                      placeholder="e.g. Travelers, Hartford, Liberty Mutual"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Policy Number</label>
                    <input
                      type="text"
                      value={glPolicyNumber}
                      onChange={(e) => setGlPolicyNumber(e.target.value)}
                      placeholder="GL-XXXXX-XX"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Coverage Amount ($)</label>
                    <input
                      type="number"
                      value={glCoverageAmount}
                      onChange={(e) => setGlCoverageAmount(e.target.value)}
                      placeholder="1000000"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Expiration Date</label>
                    <input
                      type="date"
                      value={glExpirationDate}
                      onChange={(e) => setGlExpirationDate(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Workers' Comp */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  2. Workers' Compensation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Carrier / Authority</label>
                    <input
                      type="text"
                      value={wcCarrier}
                      onChange={(e) => setWcCarrier(e.target.value)}
                      placeholder="e.g. Texas Mutual"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Policy Number</label>
                    <input
                      type="text"
                      value={wcPolicyNumber}
                      onChange={(e) => setWcPolicyNumber(e.target.value)}
                      placeholder="WC-XXXXX-XX"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Coverage Amount ($)</label>
                    <input
                      type="number"
                      value={wcCoverageAmount}
                      onChange={(e) => setWcCoverageAmount(e.target.value)}
                      placeholder="500000"
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Expiration Date</label>
                    <input
                      type="date"
                      value={wcExpirationDate}
                      onChange={(e) => setWcExpirationDate(e.target.value)}
                      className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LICENSING (DEFERRABLE) */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-sky-500 pl-3 py-1 bg-sky-950/20 text-sky-200">
                Licensing information can be added or updated at any time in Comply.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    State Trade License Number
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. TECL-38492"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Licensing State
                  </label>
                  <input
                    type="text"
                    value={licenseState}
                    onChange={(e) => setLicenseState(e.target.value.toUpperCase())}
                    placeholder="TX"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Issuing Board / Authority
                  </label>
                  <input
                    type="text"
                    value={issuingBoard}
                    onChange={(e) => setIssuingBoard(e.target.value)}
                    placeholder="e.g. Texas Dept of Licensing & Regulation (TDLR)"
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-mono uppercase tracking-wider text-[11px]">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={licenseExpirationDate}
                    onChange={(e) => setLicenseExpirationDate(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TEAM INVITES (OPTIONAL) */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="border-l-2 border-sky-500 pl-3 py-1 bg-sky-950/20 text-sky-200">
                Optional: Invite office staff or field supervisors via email (powered by Resend). Only you remain the owner.
              </div>

              <div className="space-y-3">
                {teamInvites.map((invite, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div className="sm:col-span-2">
                      <input
                        type="email"
                        value={invite.email}
                        onChange={(e) => updateTeamRow(idx, 'email', e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={invite.role}
                        onChange={(e) => updateTeamRow(idx, 'role', e.target.value)}
                        className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                      >
                        <option value="office_staff">Office Staff</option>
                        <option value="field">Field Crew</option>
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTeamRow}
                  className="text-sky-400 hover:text-sky-300 font-mono text-[11px] uppercase tracking-wider"
                >
                  + Add another team member
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-800 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                  className="text-slate-400 hover:text-slate-200 font-mono text-xs underline underline-offset-4"
                >
                  Skip for now →
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !companyName.trim()) {
                      setError('Company name is required to continue.');
                      return;
                    }
                    setError(null);
                    setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
                  }}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Finalizing Setup...' : 'Enter Workspace →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-[10px] font-mono text-slate-600 pt-8">
        AVORRIA CONTRACTORS USA • SECURE ONBOARDING SHELL
      </footer>
    </div>
  );
}
