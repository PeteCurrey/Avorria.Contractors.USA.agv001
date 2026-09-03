'use client';

import React, { useState, useEffect } from 'react';
import { STANDARD_TRADES } from '@/lib/trades/registry';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

export default function BusinessProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [dbaName, setDbaName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [businessStructure, setBusinessStructure] = useState('llc');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [employeeCount, setEmployeeCount] = useState(1);
  const [primaryTrade, setPrimaryTrade] = useState('electrical-contracting');
  const [additionalTrades, setAdditionalTrades] = useState<string[]>([]);
  const [primaryState, setPrimaryState] = useState('TX');
  const [radiusMiles, setRadiusMiles] = useState(50);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/contractor/workspace');
        if (res.ok) {
          const data = await res.json();
          const org = data.workspace.organisation;
          const prof = data.workspace.profile;
          const areas = data.workspace.serviceAreas;

          setName(org.name || '');
          setLegalName(org.legal_name || '');
          setDbaName(prof?.dba_name || '');
          setBusinessStructure(org.business_structure || 'llc');
          setPhone(org.phone || '');
          setEmail(org.email || '');
          setWebsite(org.website || '');
          setEmployeeCount(prof?.employee_count || 1);
          if (data.workspace.trades?.length > 0) {
            setPrimaryTrade(data.workspace.trades[0]);
            setAdditionalTrades(data.workspace.trades.slice(1));
          }
          if (areas) {
            setPrimaryState(areas.primaryState || 'TX');
            setRadiusMiles(areas.radiusMiles || 50);
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/contractor/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          legalName,
          dbaName,
          businessStructure,
          phone,
          email,
          website,
          employeeCount: Number(employeeCount),
          trades: [primaryTrade, ...additionalTrades],
          primaryState,
          radiusMiles: Number(radiusMiles),
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: 'Business profile successfully updated and persisted.' });
      } else {
        setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving profile changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTradeToggle = (slug: string) => {
    if (slug === primaryTrade) return;
    if (additionalTrades.includes(slug)) {
      setAdditionalTrades(additionalTrades.filter((t) => t !== slug));
    } else {
      setAdditionalTrades([...additionalTrades, slug]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading business profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div className="border-b border-surface-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Business Profile</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your company identity, structured trade qualifications, and operational service radius.
          </p>
        </div>
        <Badge variant="neutral" size="md">
          {primaryState} License Jurisdiction
        </Badge>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Identity */}
        <Card variant="default" className="space-y-4">
          <CardTitle className="text-base">01 / Company Identity</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="DBA / Trading Name (Optional)"
              value={dbaName}
              onChange={(e) => setDbaName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Legal Business Structure"
              value={businessStructure}
              onChange={(e) => setBusinessStructure(e.target.value)}
              options={[
                { value: 'llc', label: 'Limited Liability Company (LLC)' },
                { value: 'corporation', label: 'Corporation (C-Corp / S-Corp)' },
                { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                { value: 'partnership', label: 'Partnership' },
              ]}
            />
            <Input
              label="Total Employees"
              type="number"
              min={1}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Business Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Trades & Capabilities */}
        <Card variant="default" className="space-y-4">
          <CardTitle className="text-base">02 / Trade Capabilities</CardTitle>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Primary Trade Classification
            </label>
            <select
              className="w-full rounded-md bg-surface-subtle border border-surface-border text-white px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
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
              Additional Recognized Scopes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STANDARD_TRADES.filter((t) => t.slug !== primaryTrade).map((trade) => {
                const isSelected = additionalTrades.includes(trade.slug);
                return (
                  <button
                    key={trade.slug}
                    type="button"
                    onClick={() => handleTradeToggle(trade.slug)}
                    className={`p-2.5 rounded-lg border text-left text-xs flex justify-between items-center ${
                      isSelected
                        ? 'bg-brand-950/60 border-brand-500 text-white'
                        : 'bg-surface-subtle border-surface-border text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{trade.name}</span>
                    <span>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Section 3: Operating Service Area */}
        <Card variant="default" className="space-y-4">
          <CardTitle className="text-base">03 / Service Radius & Operating Territory</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary State"
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
                { value: 'OTHER', label: 'Other State' },
              ]}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Radius: <span className="text-brand-400 font-mono font-bold">{radiusMiles} miles</span>
              </label>
              <input
                type="range"
                min={10}
                max={250}
                step={5}
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
                className="w-full accent-brand-500 mt-2"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            Save Profile Changes ✓
          </Button>
        </div>
      </form>
    </div>
  );
}
