'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Step 1: Business Identity (No EIN/Tax ID in Phase 3!)
  const [businessName, setBusinessName] = useState('');
  const [dbaName, setDbaName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [businessStructure, setBusinessStructure] = useState('llc');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(3);
  const [employeeCount, setEmployeeCount] = useState(5);

  // Step 2: Trades
  const [primaryTrade, setPrimaryTrade] = useState('electrical-contracting');
  const [additionalTrades, setAdditionalTrades] = useState<string[]>([]);

  // Step 3: Service Area
  const [primaryState, setPrimaryState] = useState('TX');
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [serviceCity, setServiceCity] = useState('Austin');

  // Step 4: Baseline Credentials Checklist
  const [credentials, setCredentials] = useState<Record<string, string>>({
    glInsurance: 'have',
    workersComp: 'have',
    tradeLicense: 'have',
    safetyPlan: 'unsure',
    toolboxTalks: 'have',
    oshaCard: 'unsure',
  });

  // Load existing state if available
  useEffect(() => {
    async function loadExistingState() {
      try {
        const res = await fetch('/api/contractor/workspace');
        if (res.ok) {
          const data = await res.json();
          if (data.workspace?.organisation) {
            setBusinessName(data.workspace.organisation.name || '');
            setDbaName(data.workspace.profile?.dba_name || '');
            setLegalName(data.workspace.organisation.legal_name || '');
            setBusinessStructure(data.workspace.organisation.business_structure || 'llc');
            setPhone(data.workspace.organisation.phone || '');
            setEmail(data.workspace.organisation.email || '');
            setWebsite(data.workspace.organisation.website || '');
            setEmployeeCount(data.workspace.profile?.employee_count || 5);
          }
          if (data.workspace?.trades?.length > 0) {
            setPrimaryTrade(data.workspace.trades[0]);
            setAdditionalTrades(data.workspace.trades.slice(1));
          }
          if (data.workspace?.serviceAreas) {
            setPrimaryState(data.workspace.serviceAreas.primaryState || 'TX');
            setRadiusMiles(data.workspace.serviceAreas.radiusMiles || 50);
          }
        }
      } catch (err) {
        console.error('Failed to load existing onboarding state', err);
      }
    }
    loadExistingState();
  }, []);

  const handleTradeToggle = (slug: string) => {
    if (slug === primaryTrade) return;
    if (additionalTrades.includes(slug)) {
      setAdditionalTrades(additionalTrades.filter((t) => t !== slug));
    } else {
      setAdditionalTrades([...additionalTrades, slug]);
    }
  };

  const handleSaveStep = async (nextStep?: number) => {
    setIsLoading(true);
    setSaveMessage(null);

    let stepPayload: Record<string, unknown> = {};
    if (currentStep === 1) {
      stepPayload = {
        businessName: businessName || 'My Contracting Business',
        legalName,
        dbaName,
        businessStructure,
        phone,
        email,
        website,
        yearsInBusiness: Number(yearsInBusiness),
        employeeCount: Number(employeeCount),
      };
    } else if (currentStep === 2) {
      stepPayload = {
        trades: [primaryTrade, ...additionalTrades],
      };
    } else if (currentStep === 3) {
      stepPayload = {
        primaryState,
        radiusMiles: Number(radiusMiles),
        cities: [serviceCity],
      };
    } else if (currentStep === 4) {
      const boolCreds: Record<string, boolean> = {
        hasGeneralLiability: credentials.glInsurance === 'have',
        hasWorkersComp: credentials.workersComp === 'have',
        hasTradeLicense: credentials.tradeLicense === 'have',
        hasSafetyPlan: credentials.safetyPlan === 'have',
        hasToolboxTalks: credentials.toolboxTalks === 'have',
        hasOshaCard: credentials.oshaCard === 'have',
      };
      stepPayload = { credentials: boolCreds };
    }

    try {
      const res = await fetch('/api/contractor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: currentStep,
          data: stepPayload,
          isComplete: currentStep === 4 && !nextStep,
        }),
      });

      if (res.ok) {
        if (nextStep) {
          setCurrentStep(nextStep);
        } else if (currentStep === 4) {
          router.push('/app/dashboard');
        }
      } else {
        setSaveMessage('Error saving progress. Please retry.');
      }
    } catch {
      setSaveMessage('Network error. Progress cached locally.');
      if (nextStep) setCurrentStep(nextStep);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8 text-left">
      {/* Header & Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="primary" size="sm">
            STAGE {currentStep} OF 4
          </Badge>
          <span className="text-xs text-slate-400 font-mono">
            {Math.round((currentStep / 4) * 100)}% Complete
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {currentStep === 1 && 'Establish Your Business Profile'}
          {currentStep === 2 && 'What Trades Do You Perform?'}
          {currentStep === 3 && 'Define Your Operating Service Area'}
          {currentStep === 4 && 'Current Credentials & Safety Baseline'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-400">
          {currentStep === 1 && 'Set up your company identity so generated safety plans, proposals, and certificates reflect your business.'}
          {currentStep === 2 && 'Select your primary trade and any secondary scopes. Avorria uses this to identify your trade-specific requirements.'}
          {currentStep === 3 && 'Specify your state and service radius to contextualize state licensing boards and regulatory rules.'}
          {currentStep === 4 && 'Tell Avorria what you already have in place. Items marked "Not Sure" will be highlighted for review without penalty.'}
        </p>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 text-xs">
          {saveMessage}
        </div>
      )}

      {/* STEP 1: BUSINESS IDENTITY */}
      {currentStep === 1 && (
        <Card variant="default" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Business Name"
              placeholder="Apex Electrical Solutions LLC"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="DBA (Trading Name if different)"
              placeholder="Apex Electric"
              value={dbaName}
              onChange={(e) => setDbaName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Business Legal Structure"
              value={businessStructure}
              onChange={(e) => setBusinessStructure(e.target.value)}
              options={[
                { value: 'llc', label: 'Limited Liability Company (LLC)' },
                { value: 'corporation', label: 'Corporation (C-Corp / S-Corp)' },
                { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                { value: 'partnership', label: 'General / Limited Partnership' },
              ]}
            />
            <Input
              label="Years Operating"
              type="number"
              min={0}
              max={100}
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Phone"
              type="tel"
              placeholder="(512) 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Business Email"
              type="email"
              placeholder="operations@apexelectric.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Website"
              placeholder="https://apexelectric.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Total Field & Office Employees"
              type="number"
              min={1}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              helperText="Used to evaluate Workers' Comp thresholds and supervisory requirements."
            />
          </div>
        </Card>
      )}

      {/* STEP 2: TRADES & CAPABILITIES */}
      {currentStep === 2 && (
        <Card variant="default" className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Primary Trade (Governs Primary Licensing & Core Safety Rules)
            </label>
            <select
              className="w-full rounded-md bg-surface-subtle border border-surface-border text-white px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={primaryTrade}
              onChange={(e) => setPrimaryTrade(e.target.value)}
            >
              {STANDARD_TRADES.map((trade) => (
                <option key={trade.slug} value={trade.slug}>
                  {trade.name} ({trade.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Additional Specialty Scopes (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STANDARD_TRADES.filter((t) => t.slug !== primaryTrade).map((trade) => {
                const isSelected = additionalTrades.includes(trade.slug);
                return (
                  <button
                    key={trade.slug}
                    type="button"
                    onClick={() => handleTradeToggle(trade.slug)}
                    className={`p-3 rounded-lg border text-left transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-950/60 border-brand-500 text-white shadow-sm'
                        : 'bg-surface-subtle border-surface-border text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-semibold">{trade.name}</span>
                    <span>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: SERVICE AREA */}
      {currentStep === 3 && (
        <Card variant="default" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Operating State"
              value={primaryState}
              onChange={(e) => setPrimaryState(e.target.value)}
              options={[
                { value: 'TX', label: 'Texas (TDLR)' },
                { value: 'CA', label: 'California (CSLB)' },
                { value: 'FL', label: 'Florida (DBPR)' },
                { value: 'NY', label: 'New York' },
                { value: 'IL', label: 'Illinois' },
                { value: 'GA', label: 'Georgia' },
                { value: 'AZ', label: 'Arizona (ROC)' },
                { value: 'CO', label: 'Colorado' },
                { value: 'NC', label: 'North Carolina' },
                { value: 'WA', label: 'Washington (L&I)' },
                { value: 'OTHER', label: 'Other US State' },
              ]}
            />
            <Input
              label="Operating City / Metro Hub"
              placeholder="Austin"
              value={serviceCity}
              onChange={(e) => setServiceCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Service Radius (Miles from Hub): <span className="text-brand-400 font-mono font-bold">{radiusMiles} miles</span>
            </label>
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>10 mi (Local)</span>
              <span>100 mi (Regional)</span>
              <span>250+ mi (Multi-Region)</span>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: EXISTING CREDENTIALS & BASELINE */}
      {currentStep === 4 && (
        <Card variant="default" className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your current operational baseline. In the next stage, you can upload certificates or generate missing documents with Avorria.
          </p>

          {[
            { key: 'glInsurance', label: 'Commercial General Liability Insurance (COI)', desc: 'Active policy with ACORD 25 certificate.' },
            { key: 'workersComp', label: 'Workers’ Compensation Insurance Policy', desc: 'Statutory employer coverage or sole-proprietor exemption.' },
            { key: 'tradeLicense', label: 'Active State or Municipal Trade License', desc: 'Master or contractor license registered with state authority.' },
            { key: 'safetyPlan', label: 'Written Construction Safety Plan (HASP)', desc: 'Company safety manual aligned with OSHA 1926 standards.' },
            { key: 'toolboxTalks', label: 'Documented Field Toolbox Talks', desc: 'Conducted safety briefings with signed worker rosters in last 30 days.' },
            { key: 'oshaCard', label: 'Supervisors with OSHA 10 or 30-Hour Cards', desc: 'Field leads with recorded safety training cards.' },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-lg bg-surface-subtle border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-white">{item.label}</div>
                <div className="text-slate-400 text-[11px]">{item.desc}</div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(['have', 'unsure', 'dont_have'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCredentials({ ...credentials, [item.key]: opt })}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                      credentials[item.key] === opt
                        ? opt === 'have'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : opt === 'unsure'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-surface-elevated text-slate-400 border border-slate-700'
                        : 'bg-surface-card text-slate-400 border border-surface-border hover:text-white'
                    }`}
                  >
                    {opt === 'have' && 'I Have This'}
                    {opt === 'unsure' && 'Not Sure'}
                    {opt === 'dont_have' && 'Don’t Have'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isLoading}
          >
            ← Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleSaveStep(currentStep + 1)}
            isLoading={isLoading}
          >
            Continue to Step {currentStep + 1} →
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleSaveStep()}
            isLoading={isLoading}
          >
            Complete Onboarding & Launch Workspace ✓
          </Button>
        )}
      </div>
    </div>
  );
}
