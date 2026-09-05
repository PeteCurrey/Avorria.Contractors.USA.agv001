'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Organization,
  WorkspaceUser,
  PRIMARY_TRADES,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/lib/workspace/types';
import { PRICING_PLANS, PlanEntitlement } from '@/config/plans';

interface SettingsClientProps {
  organization: Organization;
  currentUser: WorkspaceUser;
}

type Tab = 'company' | 'billing' | 'notifications';

const PLAN_COLORS: Record<string, string> = {
  free: 'text-slate-400 border-slate-600',
  professional: 'text-sky-400 border-sky-600',
  verified: 'text-emerald-400 border-emerald-600',
  business: 'text-violet-400 border-violet-600',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400',
  trialing: 'text-sky-400',
  past_due: 'text-amber-400',
  canceled: 'text-rose-400',
  unpaid: 'text-rose-400',
  incomplete: 'text-amber-400',
  none: 'text-slate-400',
};

function formatDate(ts: string | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `\$${(cents / 100).toFixed(0)}/mo`;
}

export function SettingsClient({ organization, currentUser }: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial tab: honour #notifications / #billing deep-link or ?tab= query param
  const paramTab = searchParams.get('tab') as Tab | null;
  const initialTab: Tab =
    paramTab === 'notifications'
      ? 'notifications'
      : paramTab === 'billing'
      ? 'billing'
      : 'company';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Company form state
  const [name, setName] = useState(organization.name);
  const [legalName, setLegalName] = useState(organization.legal_name || '');
  const [entityType, setEntityType] = useState(organization.entity_type || 'LLC');
  const [ein, setEin] = useState(organization.ein || '');
  const [primaryTrade, setPrimaryTrade] = useState(organization.primary_trade);
  const [statesLicensed, setStatesLicensed] = useState(organization.states_licensed.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Billing state
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(
    currentUser.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  const canEdit = currentUser.role === 'owner' || currentUser.role === 'admin';

  // Switch tab if hash is present on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#billing') {
        setActiveTab('billing');
      } else if (window.location.hash === '#notifications') {
        setActiveTab('notifications');
      }
    }
  }, []);

  async function handleSaveNotif(e: React.FormEvent) {
    e.preventDefault();
    setSavingNotif(true);
    setNotifError(null);
    setNotifSuccess(false);

    try {
      const res = await fetch('/api/workspace/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifPrefs),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences');

      setNotifSuccess(true);
      if (data.preferences) setNotifPrefs(data.preferences);
      router.refresh();
    } catch (err: unknown) {
      setNotifError(err instanceof Error ? err.message : 'Error updating preferences');
    } finally {
      setSavingNotif(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setFormError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/workspace/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          legal_name: legalName.trim() || undefined,
          entity_type: entityType,
          ein: ein.trim() || undefined,
          primary_trade: primaryTrade,
          states_licensed: statesLicensed.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSaveSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  }

  const handlePortal = useCallback(async () => {
    setPortalLoading(true);
    setBillingError(null);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal');
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  }, []);

  const handleUpgrade = useCallback(async (planId: string) => {
    setCheckoutLoadingPlan(planId);
    setBillingError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval: 'monthly' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) {
        window.location.href = data.url;
      } else if (data.provisioned) {
        // Free plan provisioned immediately
        router.refresh();
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: unknown) {
      setBillingError(err instanceof Error ? err.message : 'Failed to start checkout');
      setCheckoutLoadingPlan(null);
    }
  }, [router]);

  const currentTier = organization.subscription_tier || 'free';
  const currentStatus = organization.subscription_status || 'none';
  const currentPlan = PRICING_PLANS.find((p) => p.id === currentTier) ?? PRICING_PLANS[0];
  const upgradePlans = PRICING_PLANS.filter((p) => {
    const order = ['free', 'professional', 'verified', 'business'];
    return order.indexOf(p.id) > order.indexOf(currentTier);
  });

  return (
    <div className="max-w-3xl space-y-0">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800 bg-[#090d16]">
        {(['company', 'billing', 'notifications'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-sky-400 border-b-2 border-sky-500 -mb-px'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'company'
              ? 'Company Details'
              : tab === 'billing'
              ? 'Billing & Plan'
              : 'Notifications'}
          </button>
        ))}
      </div>

      {/* ── COMPANY TAB ── */}
      {activeTab === 'company' && (
        <form
          onSubmit={handleSave}
          className="border border-slate-800 border-t-0 bg-[#090d16] p-6 sm:p-8 space-y-6"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Company Legal Details
            </h2>
            {saveSuccess && (
              <span className="text-xs font-mono text-emerald-400">
                ✓ Settings saved successfully
              </span>
            )}
          </div>

          {formError && (
            <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
              {formError}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Business Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Legal Entity Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Entity Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
                >
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Federal EIN / Tax ID
                </label>
                <input
                  type="text"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  disabled={!canEdit}
                  placeholder="XX-XXXXXXX (Encrypted at rest)"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  Primary Trade <span className="text-sky-400">*</span>
                </label>
                <select
                  value={primaryTrade}
                  onChange={(e) => setPrimaryTrade(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-sans focus:border-sky-500 focus:outline-none disabled:opacity-60"
                >
                  {PRIMARY_TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-mono uppercase text-[11px]">
                  States Licensed In
                </label>
                <input
                  type="text"
                  value={statesLicensed}
                  onChange={(e) => setStatesLicensed(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. TX, OK, LA"
                  className="w-full bg-[#030712] border border-slate-700 px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* ── BILLING TAB ── */}
      {activeTab === 'billing' && (
        <section
          id="billing"
          className="border border-slate-800 border-t-0 bg-[#090d16] p-6 sm:p-8 space-y-8"
        >
          {/* Error banner */}
          {billingError && (
            <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
              {billingError}
            </div>
          )}

          {/* ── Current plan card ── */}
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-3 mb-5">
              Current Plan
            </h2>

            <div className="border border-slate-800 bg-[#030712] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 border font-mono text-xs uppercase font-bold ${
                      PLAN_COLORS[currentTier] ?? 'text-slate-400 border-slate-600'
                    }`}
                  >
                    {currentPlan.name}
                  </span>
                  {currentStatus !== 'none' && (
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wider ${
                        STATUS_COLORS[currentStatus] ?? 'text-slate-400'
                      }`}
                    >
                      {currentStatus === 'past_due' ? '⚠ Payment Past Due' : currentStatus}
                    </span>
                  )}
                  {organization.cancel_at_period_end && (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400">
                      Cancels at period end
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400 space-y-0.5">
                  <p>{currentPlan.description}</p>
                  {organization.current_period_end && (
                    <p>
                      {organization.cancel_at_period_end ? 'Access until' : 'Renews'}:{' '}
                      <span className="text-slate-300">
                        {formatDate(organization.current_period_end)}
                      </span>
                    </p>
                  )}
                  <p>
                    Price:{' '}
                    <span className="text-slate-300">{formatPrice(currentPlan.monthlyPriceCents)}</span>
                  </p>
                </div>
              </div>

              {/* Portal button — only show when has a Stripe subscription */}
              {organization.stripe_subscription_id && canEdit && (
                <button
                  type="button"
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="shrink-0 px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {portalLoading ? 'Opening...' : 'Manage Billing & Invoices →'}
                </button>
              )}
            </div>

            {/* Past-due warning */}
            {currentStatus === 'past_due' && (
              <div className="mt-3 border border-amber-500/30 bg-amber-950/20 text-amber-300 p-3 text-xs font-mono">
                ⚠ Your last payment failed. Your plan is still active during the grace period. Please
                update your payment method to avoid service interruption.{' '}
                {organization.stripe_subscription_id && (
                  <button
                    type="button"
                    onClick={handlePortal}
                    className="underline hover:text-amber-200"
                  >
                    Update payment method
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Plan features summary ── */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
              Your Plan Includes
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentPlan.features.map((f) => (
                <li key={f.title} className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={f.included ? 'text-emerald-400' : 'text-slate-600'}
                    aria-hidden="true"
                  >
                    {f.included ? '✓' : '✗'}
                  </span>
                  <span className={f.included ? 'text-slate-300' : 'text-slate-600'}>
                    {f.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Upgrade options ── */}
          {upgradePlans.length > 0 && canEdit && (
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-3 mb-5">
                Upgrade Your Plan
              </h2>

              <div className="space-y-3">
                {upgradePlans.map((plan) => (
                  <UpgradePlanRow
                    key={plan.id}
                    plan={plan}
                    isLoading={checkoutLoadingPlan === plan.id}
                    onUpgrade={() => handleUpgrade(plan.id)}
                  />
                ))}
              </div>

              <p className="mt-4 text-[11px] font-mono text-slate-500">
                Annual billing saves up to 17%. Manage billing, invoices, and payment methods via
                the Stripe Customer Portal above.
              </p>
            </div>
          )}

          {/* Already on top-tier */}
          {upgradePlans.length === 0 && (
            <div className="border border-slate-800 bg-[#030712] p-4 text-center">
              <p className="text-xs font-mono text-slate-400">
                You&apos;re on the <span className="text-violet-400 font-bold">Business</span> plan —
                the highest tier. Thank you for supporting Avorria.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <form
          id="notifications"
          onSubmit={handleSaveNotif}
          className="border border-slate-800 border-t-0 bg-[#090d16] p-6 sm:p-8 space-y-8"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Notification Channels & Routing
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Configure renewal alerts, delivery cadence, and team dispatch rules.
              </p>
            </div>
            {notifSuccess && (
              <span className="text-xs font-mono text-emerald-400">
                ✓ Preferences updated
              </span>
            )}
          </div>

          {notifError && (
            <div className="border border-rose-500/30 bg-rose-950/20 text-rose-300 p-2.5 text-xs font-mono">
              {notifError}
            </div>
          )}

          {/* Delivery Channels */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Alert Delivery Channels
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 border border-slate-800 bg-[#030712] rounded cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={notifPrefs.expiry_alerts_email}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, expiry_alerts_email: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-white block">
                    Credential Expiry Email Alerts
                  </span>
                  <span className="text-xs text-slate-400 font-mono block">
                    Deliver 60, 30, 14-day and expiration warnings directly to your email inbox ({currentUser.email || 'account email'}).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border border-slate-800 bg-[#030712] rounded cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={notifPrefs.expiry_alerts_inapp}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, expiry_alerts_inapp: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-white block">
                    In-App Notification Center
                  </span>
                  <span className="text-xs text-slate-400 font-mono block">
                    Display badge counters and notification items in the top navigation bell and workspace feed.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border border-slate-800 bg-[#030712] rounded cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={notifPrefs.billing_alerts_email}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, billing_alerts_email: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-white block">
                    Subscription & Billing Invoices
                  </span>
                  <span className="text-xs text-slate-400 font-mono block">
                    Receive payment receipts, renewal notices, and grace-period alerts via email.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Digest Option */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Email Delivery Frequency (Digest Mode)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Choose whether to receive individual alert emails immediately per expiring document, or a consolidated digest summary.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                {
                  id: 'immediate',
                  title: 'Immediate Alerts',
                  desc: 'Send an email instantly whenever a credential hits a threshold (Recommended for sole operators).',
                },
                {
                  id: 'daily',
                  title: 'Daily Digest',
                  desc: 'Consolidate all active warnings into a single morning briefing email.',
                },
                {
                  id: 'weekly',
                  title: 'Weekly Digest',
                  desc: 'One summary email per week listing upcoming deadlines across your fleet.',
                },
              ].map((mode) => (
                <label
                  key={mode.id}
                  className={`p-3.5 border rounded cursor-pointer transition-colors block ${
                    notifPrefs.digest_mode === mode.id
                      ? 'border-sky-500 bg-sky-950/20'
                      : 'border-slate-800 bg-[#030712] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <input
                      type="radio"
                      name="digest_mode"
                      value={mode.id}
                      checked={notifPrefs.digest_mode === mode.id}
                      onChange={() =>
                        setNotifPrefs((prev) => ({ ...prev, digest_mode: mode.id as any }))
                      }
                      className="text-sky-500 focus:ring-sky-400"
                    />
                    <span className="text-xs font-mono font-bold text-white">
                      {mode.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block leading-relaxed">
                    {mode.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Escalation Policy Notice */}
          <div className="p-4 border border-amber-500/30 bg-amber-950/20 rounded">
            <div className="flex items-start gap-2.5">
              <span className="text-sm">🔴</span>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase block">
                  Mandatory Escalation Policy
                </span>
                <p className="text-[11px] font-mono text-amber-400/90 leading-relaxed">
                  To protect contractor readiness and preserve your Verified Contractor badge, <strong>14-day advance warnings and expiration notices</strong> are classified as critical compliance events and will always be dispatched to all registered Owners and Admins on the account, regardless of individual email preference settings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={savingNotif}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {savingNotif ? 'Saving...' : 'Save Notification Preferences'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Upgrade plan row sub-component ──
function UpgradePlanRow({
  plan,
  isLoading,
  onUpgrade,
}: {
  plan: PlanEntitlement;
  isLoading: boolean;
  onUpgrade: () => void;
}) {
  const colorClass = PLAN_COLORS[plan.id] ?? 'text-slate-400 border-slate-600';

  return (
    <div className="border border-slate-800 bg-[#030712] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-mono font-bold uppercase border px-2 py-0.5 ${colorClass}`}>
            {plan.name}
          </span>
          <span className="text-xs font-mono text-slate-300">
            {formatPrice(plan.monthlyPriceCents)}
          </span>
          {plan.annualPriceCents > 0 && (
            <span className="text-[11px] font-mono text-slate-500">
              · {`\$${(plan.annualPriceCents / 100).toFixed(0)}/yr`}
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
          {plan.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onUpgrade}
        disabled={isLoading}
        className={`shrink-0 px-5 py-2 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 ${
          plan.id === 'professional'
            ? 'bg-sky-500 hover:bg-sky-400 text-black font-bold'
            : plan.id === 'verified'
            ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-bold'
            : 'bg-violet-500 hover:bg-violet-400 text-white font-bold'
        }`}
      >
        {isLoading ? 'Redirecting...' : `Upgrade to ${plan.name} →`}
      </button>
    </div>
  );
}
