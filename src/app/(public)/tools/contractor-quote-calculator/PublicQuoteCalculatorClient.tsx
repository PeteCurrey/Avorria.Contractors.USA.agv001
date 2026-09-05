'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateQuoteFinancials, QuoteMathInput } from '@/lib/create/math';
import { BrandMark } from '@/components/brand/BrandMark';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_cost: number;
}

export function PublicQuoteCalculatorClient() {
  // Project & Client Metadata
  const [projectName, setProjectName] = useState('Centennial Plaza Switchgear & Distribution');
  const [clientName, setClientName] = useState('Pacific Commercial Builders LLC');
  const [siteAddress, setSiteAddress] = useState('100 Congress Ave, Suite 400, Austin TX');
  const [contractorName, setContractorName] = useState('Vance Commercial Electric');
  const [trade, setTrade] = useState('Electrical Contracting');

  // Financial Variables
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '480V 3-Phase Main Distribution Panel', quantity: 2, unit_cost: 14500 },
    { id: '2', description: '500 MCM Copper Feeder Cable (1000ft spool)', quantity: 4, unit_cost: 3200 },
    { id: '3', description: 'Heavy-Duty Rigid Steel Conduit & Fittings', quantity: 120, unit_cost: 65 },
  ]);

  const [laborHours, setLaborHours] = useState(160);
  const [laborRate, setLaborRate] = useState(95);
  const [overheadPct, setOverheadPct] = useState(15);
  const [targetMarginPct, setTargetMarginPct] = useState(22);

  // Status & Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Real-time financial calculations via deterministic math engine
  const financials = useMemo(() => {
    const mathInput: QuoteMathInput = {
      line_items: lineItems.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity) || 0,
        unit_cost: Number(li.unit_cost) || 0,
      })),
      labor_hours: Number(laborHours) || 0,
      labor_rate: Number(laborRate) || 0,
      overhead_percentage: Number(overheadPct) || 0,
      target_margin_percentage: Number(targetMarginPct) || 0,
    };
    return calculateQuoteFinancials(mathInput);
  }, [lineItems, laborHours, laborRate, overheadPct, targetMarginPct]);

  // Line Item Handlers
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: 'New Material / Equipment Item', quantity: 1, unit_cost: 500 },
    ]);
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // PDF Generation & Direct Download
  const handleDownloadPdfQuote = async () => {
    setIsGenerating(true);
    setRateLimitError(null);
    setDownloadSuccess(false);

    try {
      const payload = {
        isPublic: true,
        userInput: {
          project_name: projectName,
          client_name: clientName,
          site_address: siteAddress,
          contractor_name: contractorName,
          trade,
          line_items: lineItems.map((li) => ({
            description: li.description,
            quantity: Number(li.quantity) || 0,
            unit_cost: Number(li.unit_cost) || 0,
          })),
          labor_hours: Number(laborHours) || 0,
          labor_rate: Number(laborRate) || 0,
          overhead_percentage: Number(overheadPct) || 0,
          target_margin_percentage: Number(targetMarginPct) || 0,
        },
      };

      const res = await fetch('/api/generate/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-tool': 'true',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 429) {
        setRateLimitError(
          data.error ||
            "You've reached the free generation limit. Create a free account to generate unlimited documents with your company branding."
        );
        return;
      }

      if (!res.ok || !data.pdfBase64) {
        throw new Error(data.error || 'Failed to generate branded quote PDF');
      }

      // Update remaining generations count
      if (data.rateLimit?.remaining !== undefined) {
        setRemainingGenerations(data.rateLimit.remaining);
      }

      // Store in localStorage for seamless onboarding transfer
      try {
        localStorage.setItem(
          'avorria_pending_document',
          JSON.stringify({
            type: 'quote',
            title: `${contractorName} - Commercial Quote`,
            userInput: payload.userInput,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Safe fallback
      }

      // Trigger instant browser download of PDF
      const byteCharacters = atob(data.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_quote.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err: any) {
      setRateLimitError(err.message || 'An unexpected error occurred during PDF generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEEF] text-[#111827] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
            <Link href="/tools" className="hover:text-[#F97316] transition-colors">
              TOOLS
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">QUOTE &amp; MARGIN CALCULATOR</span>
            <span>/</span>
            <span className="px-2 py-0.5 bg-orange-100 text-[#F97316] font-bold rounded text-[10px]">
              DETERMINISTIC MATH
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#111827]">
                Contractor Quote &amp; Margin Calculator
              </h1>
              <p className="text-sm text-[#64748B] mt-1 max-w-2xl font-light">
                Calculate direct materials, labor burden, overhead markups, and exact commercial gross profit margins.
                Generate a ready-to-sign, branded PDF quote instantly.
              </p>
            </div>

            {remainingGenerations !== null && (
              <div className="self-start md:self-auto px-3 py-1.5 bg-white border border-[#E2E4E8] rounded-md shadow-xs text-xs font-mono text-[#64748B]">
                FREE SESSIONS REMAINING:{' '}
                <span className="font-bold text-[#F97316]">{remainingGenerations} / 3</span>
              </div>
            )}
          </div>
        </div>

        {/* Rate Limit Block Banner */}
        {rateLimitError && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                Free Generation Limit Reached
              </div>
              <p className="text-sm">{rateLimitError}</p>
            </div>
            <Link
              href="/sign-up?intent=quote_limit"
              className="whitespace-nowrap px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-medium text-xs rounded transition-colors"
            >
              Create Free Account →
            </Link>
          </div>
        )}

        {/* Post-Download Upsell Banner */}
        {downloadSuccess && (
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-300">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                Quote PDF Generated &amp; Downloaded
              </div>
              <p className="text-sm">
                Save this quote to your account, brand it with your custom company logo, and unlock unlimited generation.
              </p>
            </div>
            <Link
              href="/sign-up?intent=save_quote"
              className="whitespace-nowrap px-4 py-2 bg-[#111827] hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors"
            >
              Save &amp; Brand Fully (Free) →
            </Link>
          </div>
        )}

        {/* Main Grid: Inputs vs Live Calculation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Project Context Card */}
            <div className="bg-white border border-[#E2E4E8] rounded-lg p-5 shadow-xs space-y-4">
              <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider border-b border-[#ECEEEF] pb-2">
                1. Project &amp; Contractor Scope
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">Contractor Name</label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">Trade Discipline</label>
                  <input
                    type="text"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">Client / Owner</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
            </div>

            {/* Direct Materials Line Items Card */}
            <div className="bg-white border border-[#E2E4E8] rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#ECEEEF] pb-2">
                <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
                  2. Direct Materials &amp; Equipment
                </div>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-mono text-[#F97316] hover:text-orange-700 font-bold uppercase tracking-wider"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center bg-[#FAFAFA] p-2 rounded border border-[#ECEEEF]"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Item Description"
                        className="w-full bg-white border border-[#E2E4E8] rounded px-2 py-1.5 text-xs text-[#111827] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-full bg-white border border-[#E2E4E8] rounded px-2 py-1.5 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unit_cost}
                        onChange={(e) => handleUpdateLineItem(item.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                        placeholder="Unit $"
                        className="w-full bg-white border border-[#E2E4E8] rounded px-2 py-1.5 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(item.id)}
                        disabled={lineItems.length <= 1}
                        className="text-[#64748B] hover:text-rose-600 disabled:opacity-30 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right text-xs font-mono text-[#64748B] pt-2">
                MATERIALS SUBTOTAL:{' '}
                <span className="font-bold text-[#111827] text-sm">
                  ${financials.subtotal_materials.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Direct Labor & Markups Card */}
            <div className="bg-white border border-[#E2E4E8] rounded-lg p-5 shadow-xs space-y-4">
              <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider border-b border-[#ECEEEF] pb-2">
                3. Direct Labor, Overhead &amp; Target Margin
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">
                    Estimated Labor Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] font-mono text-[11px] uppercase mb-1">
                    Labor Burden Rate ($/Hour)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={laborRate}
                    onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FAFAFA] border border-[#E2E4E8] rounded px-3 py-2 text-sm text-[#111827] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#64748B] font-mono text-[11px] uppercase">
                      Overhead Markup (%)
                    </label>
                    <span className="font-mono text-xs font-bold text-[#111827]">{overheadPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={overheadPct}
                    onChange={(e) => setOverheadPct(parseFloat(e.target.value) || 0)}
                    className="w-full accent-[#F97316] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#64748B] font-mono text-[11px] uppercase">
                      Target Profit Margin (%)
                    </label>
                    <span className="font-mono text-xs font-bold text-[#F97316]">{targetMarginPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={targetMarginPct}
                    onChange={(e) => setTargetMarginPct(parseFloat(e.target.value) || 0)}
                    className="w-full accent-[#F97316] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Arithmetic Summary & PDF Download (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E2E4E8] rounded-lg p-6 shadow-sm space-y-6 sticky top-6">
              <div className="flex items-center justify-between border-b border-[#ECEEEF] pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B]">
                  Financial Breakdown
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded">
                  VERIFIED FORMULA
                </span>
              </div>

              {/* Financial Ledger Table */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Materials Subtotal:</span>
                  <span className="text-[#111827] font-medium">${financials.subtotal_materials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Labor Subtotal ({laborHours} hrs @ ${laborRate}/hr):</span>
                  <span className="text-[#111827] font-medium">${financials.subtotal_labor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[#ECEEEF] pt-2 font-bold text-[#111827]">
                  <span>Direct Job Cost:</span>
                  <span>${financials.direct_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#64748B] pt-1">
                  <span>Overhead ({overheadPct}%):</span>
                  <span className="text-[#111827] font-medium">+${financials.overhead_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[#ECEEEF] pt-2 font-bold text-[#111827]">
                  <span>Total Burdened Cost:</span>
                  <span>${financials.total_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Gross Profit ({targetMarginPct}% Margin):</span>
                  <span>+${financials.profit_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Primary Contract Price Box */}
              <div className="p-4 bg-[#111827] rounded-lg text-white space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F97316] font-bold">
                  TOTAL CONTRACT PRICE
                </div>
                <div className="text-3xl font-light tracking-tight">
                  ${financials.contract_price.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-[#64748B] pt-1 border-t border-slate-700/60 flex justify-between">
                  <span>EFFECTIVE GROSS MARGIN:</span>
                  <span className="text-[#F97316] font-bold">{targetMarginPct}%</span>
                </div>
              </div>

              {/* PDF Generation Action */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdfQuote}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs uppercase tracking-wider rounded transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Branded PDF Quote...</span>
                    </>
                  ) : (
                    <span>Download Branded PDF Quote</span>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#64748B] font-light">
                  Free unauthenticated tool (up to 3 documents per session). Full vector Avorria attribution.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="pt-4 border-t border-[#ECEEEF] space-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Strict commercial margin formula (Price = Cost / (1 - Margin))</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Official Avorria crystalline vector brand mark</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Executive summary, labor breakdown &amp; payment schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
