'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, WorkspaceUser, WorkspaceDocument } from '@/lib/workspace/types';
import { CreateDocumentType } from '@/lib/create/types';
import { calculateQuoteFinancials, calculateChangeOrderFinancials } from '@/lib/create/math';

interface CreateWizardClientProps {
  docType: CreateDocumentType;
  organization: Organization;
  user: WorkspaceUser;
}

export function CreateWizardClient({ docType, organization, user }: CreateWizardClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [upgradeTier, setUpgradeTier] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [generatedDoc, setGeneratedDoc] = useState<WorkspaceDocument | null>(null);

  useEffect(() => {
    fetch('/api/billing/entitlements')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setEntitlements(d.entitlements);
      })
      .catch(() => {});
  }, []);

  // Signature state
  const [signerName, setSignerName] = useState(user.full_name || '');
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Common metadata
  const [projectName, setProjectName] = useState('');
  const [siteAddress, setSiteAddress] = useState(organization.hq_address?.street || '');
  const [trade, setTrade] = useState(organization.primary_trade || 'General Contracting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // JHA specific state
  const [jhaTasks, setJhaTasks] = useState([
    {
      task_description: 'Lockout/Tagout de-energization and panel tie-in',
      equipment_materials: 'Multimeter, LOTO hasps, insulated screwdrivers',
      hazard_type: 'Electrical Arc Flash / Shock',
    },
    {
      task_description: 'Overhead conduit installation at ceiling plenum',
      equipment_materials: 'Scissor lift, 1-inch EMT conduit, cordless bandsaw',
      hazard_type: 'Fall from Height / Struck-by',
    },
  ]);

  // JSA specific state
  const [jsaTaskName, setJsaTaskName] = useState('Compressor Replacement Hoisting');
  const [jsaCrew, setJsaCrew] = useState('Mechanical Crew #1');
  const [jsaLocation, setJsaLocation] = useState('Building 4 - Rooftop Deck');
  const [jsaSteps, setJsaSteps] = useState([
    { step_description: 'Crane staging and outrigger pad verification' },
    { step_description: 'Rigging compressor unit with certified nylon slings' },
    { step_description: 'Guiding unit onto roof curb with dual taglines' },
  ]);

  // Safety Plan specific state
  const [projectScope, setProjectScope] = useState('Complete commercial mechanical and electrical renovation.');
  const [durationWeeks, setDurationWeeks] = useState(16);
  const [safetyOfficer, setSafetyOfficer] = useState(user.full_name || 'Marcus Vance');
  const [selectedHazards, setSelectedHazards] = useState(['Fall Protection', 'Electrical Safety', 'Excavation & Trenching', 'PPE Standards']);

  // Toolbox Talk specific state
  const [toolboxTopic, setToolboxTopic] = useState('Fall Protection & Leading Edge Awareness');
  const [durationMinutes, setDurationMinutes] = useState(10);

  // Quote specific state
  const [clientName, setClientName] = useState('Pacific Commercial Real Estate');
  const [quoteLineItems, setQuoteLineItems] = useState([
    { description: 'Commercial Rooftop HVAC Package Unit 50-Ton', quantity: 1, unit_cost: 32000 },
    { description: 'Galvanized Sheet Metal Ductwork Transitions', quantity: 200, unit_cost: 48 },
    { description: 'Honeywell BACnet Commercial Thermostats', quantity: 6, unit_cost: 450 },
  ]);
  const [laborHours, setLaborHours] = useState(120);
  const [laborRate, setLaborRate] = useState(95);
  const [overheadPct, setOverheadPct] = useState(15);
  const [targetMarginPct, setTargetMarginPct] = useState(20);

  // Change Order specific state
  const [coNumber, setCoNumber] = useState('CO-001');
  const [origContractSum, setOrigContractSum] = useState(85000);
  const [priorCoSum, setPriorCoSum] = useState(4500);
  const [coReason, setCoReason] = useState<'unforeseen_site_conditions' | 'owner_revision' | 'architectural_bulletin' | 'code_compliance'>('unforeseen_site_conditions');
  const [coAddedItems, setCoAddedItems] = useState([
    { description: 'Rerouting 4" chilled water lines around structural column', quantity: 35, unit_cost: 85 },
    { description: 'High-pressure flanged isolation valves', quantity: 2, unit_cost: 620 },
  ]);
  const [coLaborHours, setCoLaborHours] = useState(24);
  const [coLaborRate, setCoLaborRate] = useState(110);
  const [coOverheadMarginPct, setCoOverheadMarginPct] = useState(18);
  const [coDaysExtension, setCoDaysExtension] = useState(5);
  const [origCompletionDate, setOrigCompletionDate] = useState('2026-11-15');

  // Live Math calculations
  const quoteMath = calculateQuoteFinancials({
    line_items: quoteLineItems,
    labor_hours: laborHours,
    labor_rate: laborRate,
    overhead_percentage: overheadPct,
    target_margin_percentage: targetMarginPct,
  });

  const coMath = calculateChangeOrderFinancials({
    original_contract_sum: origContractSum,
    prior_change_orders_sum: priorCoSum,
    added_items: coAddedItems,
    added_labor_hours: coLaborHours,
    added_labor_rate: coLaborRate,
    added_overhead_margin_pct: coOverheadMarginPct,
    time_extension_calendar_days: coDaysExtension,
    original_completion_date: origCompletionDate,
  });

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Generation Handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      let userInput: Record<string, any> = {};

      if (docType === 'jha') {
        userInput = {
          project_name: projectName || 'Commercial Project',
          site_address: siteAddress || 'Site Location',
          trade,
          date,
          tasks: jhaTasks,
        };
      } else if (docType === 'jsa') {
        userInput = {
          job_task_name: jsaTaskName,
          department_or_crew: jsaCrew,
          location: jsaLocation,
          date,
          steps: jsaSteps,
        };
      } else if (docType === 'safety_plan') {
        userInput = {
          project_name: projectName || 'Commercial Project',
          company_name: organization.name,
          site_address: siteAddress || 'Site Location',
          project_scope: projectScope,
          duration_weeks: durationWeeks,
          site_safety_officer: safetyOfficer,
          selected_hazards: selectedHazards,
        };
      } else if (docType === 'toolbox_talk') {
        userInput = {
          topic: toolboxTopic,
          trade,
          date,
          duration_minutes: durationMinutes,
        };
      } else if (docType === 'quote') {
        userInput = {
          project_name: projectName || 'Commercial Scope',
          client_name: clientName,
          site_address: siteAddress,
          date,
          line_items: quoteLineItems,
          labor_hours: laborHours,
          labor_rate: laborRate,
          overhead_percentage: overheadPct,
          target_margin_percentage: targetMarginPct,
        };
      } else if (docType === 'change_order') {
        userInput = {
          change_order_number: coNumber,
          project_name: projectName || 'Commercial Project',
          client_name: clientName,
          date,
          reason_for_change: coReason,
          original_contract_sum: origContractSum,
          prior_change_orders_sum: priorCoSum,
          added_items: coAddedItems,
          added_labor_hours: coLaborHours,
          added_labor_rate: coLaborRate,
          added_overhead_margin_pct: coOverheadMarginPct,
          time_extension_calendar_days: coDaysExtension,
          original_completion_date: origCompletionDate,
        };
      }

      const res = await fetch(`/api/generate/${docType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.upgradeTier) {
          setUpgradeTier(data.upgradeTier);
        }
        throw new Error(data.error || 'Failed to generate document');
      }

      if (data.entitlements) {
        setEntitlements((prev: any) => ({
          ...prev,
          limits: {
            ...prev?.limits,
            remainingGenerationsThisMonth: data.entitlements.remainingGenerations,
            usedGenerationsThisMonth: data.entitlements.usedGenerations,
          },
        }));
      }

      setGeneratedDoc(data.document);
      setStep(2);
    } catch (err: any) {
      setGenerationError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Digital Signature Handler
  const handleSign = async () => {
    if (!generatedDoc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSigning(true);
    setSignatureError(null);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');
      const res = await fetch(`/api/documents/${generatedDoc.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerName,
          signatureImage: signatureDataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute digital signature');
      }

      setGeneratedDoc(data.document);
      setSignSuccess(true);
      setStep(3);
    } catch (err: any) {
      setSignatureError(err.message || 'Signature failed — please try again');
    } finally {
      setIsSigning(false);
    }
  };

  const docTitleMap: Record<CreateDocumentType, string> = {
    jha: 'Job Hazard Analysis (JHA)',
    jsa: 'Job Safety Analysis (JSA)',
    safety_plan: 'Construction Safety Plan (HASP)',
    toolbox_talk: 'Toolbox Safety Talk',
    quote: 'Commercial Quote & Proposal',
    change_order: 'Change Order Agreement',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Wizard Header & Step Indicator */}
      <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/workspace/create" className="text-xs font-mono text-neutral-500 hover:text-[#F97316] transition-colors uppercase">
              ← Create Studio
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-mono text-xs font-bold text-[#F97316] uppercase">
              {docTitleMap[docType]}
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-neutral-900 tracking-tight">
            {step === 1 ? `Configure ${docTitleMap[docType]}` : step === 2 ? 'Review & Execute Document' : 'Document Executed & Stored'}
          </h1>
        </div>

        {/* Step Numbers */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${step === 1 ? 'bg-neutral-900 border-neutral-900 text-white font-bold' : 'bg-neutral-50 border-[#E2E4E8] text-neutral-500'}`}>
            {step === 1 && <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />}
            <span>1. SPECIFY</span>
          </div>
          <div className="text-neutral-300">→</div>
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${step === 2 ? 'bg-neutral-900 border-neutral-900 text-white font-bold' : 'bg-neutral-50 border-[#E2E4E8] text-neutral-500'}`}>
            {step === 2 && <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />}
            <span>2. REVIEW</span>
          </div>
          <div className="text-neutral-300">→</div>
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${step === 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-neutral-50 border-[#E2E4E8] text-neutral-500'}`}>
            {step === 3 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            <span>3. SIGN &amp; EXPORT</span>
          </div>
        </div>
      </div>

      {/* Monthly Quota Indicator for Free Tier */}
      {entitlements?.limits?.monthlyGenerations > 0 && (
        <div className="bg-white border border-[#E2E4E8] rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span>FREE STARTER USAGE:</span>
            <span className="font-bold text-neutral-900">
              {entitlements.limits.remainingGenerationsThisMonth} of {entitlements.limits.monthlyGenerations} REMAINING THIS MONTH
            </span>
          </div>
          <Link
            href="/workspace/settings#billing"
            className="text-xs font-mono font-bold text-[#F97316] hover:text-orange-700 uppercase tracking-wider"
          >
            Upgrade for Unlimited →
          </Link>
        </div>
      )}

      {/* Feature Locked / Plan Upgrade Prompt */}
      {entitlements && !entitlements.canGenerate[docType] && (
        <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
              PLAN UPGRADE REQUIRED
            </span>
            <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 font-mono text-[10px] font-bold rounded">
              PROFESSIONAL TIER
            </span>
          </div>
          <p className="text-sm text-amber-900 font-light">
            {docType === 'safety_plan'
              ? 'Site-Specific Construction Safety Plans are a Professional tier feature ($39/mo). Upgrade to unlock complete OSHA 1926 safety manuals.'
              : docType === 'quote' || docType === 'change_order'
              ? 'Commercial Quotes & Change Orders require the Professional plan ($39/mo). Upgrade to unlock deterministic pricing and export.'
              : 'This document type requires an active Professional plan.'}
          </p>
          <div className="pt-2">
            <Link
              href="/workspace/settings#billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-medium text-xs rounded-xl transition-colors shadow-xs"
            >
              <span>Upgrade to Professional ($39/mo)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {generationError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[20px] p-4 space-y-2 font-mono text-xs text-rose-800">
          <div><span className="font-bold">GENERATION BLOCKED:</span> {generationError}</div>
          {upgradeTier && (
            <div className="pt-1">
              <Link
                href="/workspace/settings#billing"
                className="inline-block px-3 py-1.5 bg-[#111827] hover:bg-slate-800 text-white text-xs font-sans font-medium rounded-lg"
              >
                Upgrade to {upgradeTier.toUpperCase()} →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* STEP 1: STRUCTURED CONFIGURATION FORM */}
      {step === 1 && (
        <div className="space-y-6">
          {/* General Project Metadata Box */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <span className="micro-label">PROJECT SPECIFICATION</span>
              <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                1. Project &amp; Site Identifiers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Westside Medical Center Overhaul"
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">SITE ADDRESS</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="e.g. 742 Healthcare Blvd, Suite 200"
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">TRADE / DISCIPLINE</label>
                <input
                  type="text"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-medium mb-1">EFFECTIVE DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* DOCUMENT-SPECIFIC STRUCTURED SECTIONS */}
          {/* A. JHA */}
          {docType === 'jha' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
                <div>
                  <span className="micro-label">HAZARD ANALYSIS</span>
                  <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                    2. Task Breakdown &amp; Controls (OSHA Hierarchy)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setJhaTasks([...jhaTasks, { task_description: '', equipment_materials: '', hazard_type: 'Struck-by / Falling Equipment' }])}
                  className="px-3 py-1.5 bg-neutral-50 hover:bg-white border border-[#E2E4E8] text-neutral-800 text-xs font-mono font-medium rounded-xl transition-colors"
                >
                  + Add Task Step
                </button>
              </div>

              <div className="space-y-3">
                {jhaTasks.map((t, idx) => (
                  <div key={idx} className="bg-neutral-50/80 border border-[#E2E4E8] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-neutral-900">TASK STEP {idx + 1}</span>
                      {jhaTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setJhaTasks(jhaTasks.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:text-rose-700 text-[11px] font-mono"
                        >
                          Remove Step
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="md:col-span-2">
                        <label className="block text-neutral-500 mb-1">TASK DESCRIPTION</label>
                        <input
                          type="text"
                          value={t.task_description}
                          onChange={(e) => {
                            const updated = [...jhaTasks];
                            updated[idx].task_description = e.target.value;
                            setJhaTasks(updated);
                          }}
                          placeholder="e.g. Core drilling 4-inch penetrations in concrete slab"
                          className="w-full bg-white border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:border-[#F97316] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-500 mb-1">PRIMARY HAZARD</label>
                        <select
                          value={t.hazard_type}
                          onChange={(e) => {
                            const updated = [...jhaTasks];
                            updated[idx].hazard_type = e.target.value;
                            setJhaTasks(updated);
                          }}
                          className="w-full bg-white border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:border-[#F97316] focus:outline-none transition-colors"
                        >
                          <option value="Electrical Arc Flash / Shock">Electrical Arc Flash / Shock</option>
                          <option value="Fall from Height / Leading Edge">Fall from Height / Leading Edge</option>
                          <option value="Struck-By / Falling Equipment">Struck-By / Falling Equipment</option>
                          <option value="Caught-In / Between Moving Parts">Caught-In / Between Moving Parts</option>
                          <option value="Silica Dust / Respiratory Hazard">Silica Dust / Respiratory Hazard</option>
                          <option value="Confined Space Atmospheric">Confined Space Atmospheric</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. JSA */}
          {docType === 'jsa' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
                <div>
                  <span className="micro-label">JOB SAFETY ANALYSIS</span>
                  <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                    2. Specific Work Activity &amp; Crew Sequence
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setJsaSteps([...jsaSteps, { step_description: '' }])}
                  className="px-3 py-1.5 bg-neutral-50 hover:bg-white border border-[#E2E4E8] text-neutral-800 text-xs font-mono font-medium rounded-xl transition-colors"
                >
                  + Add Sequence Step
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">TASK NAME</label>
                  <input
                    type="text"
                    value={jsaTaskName}
                    onChange={(e) => setJsaTaskName(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">CREW / SQUAD</label>
                  <input
                    type="text"
                    value={jsaCrew}
                    onChange={(e) => setJsaCrew(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">EXACT LOCATION</label>
                  <input
                    type="text"
                    value={jsaLocation}
                    onChange={(e) => setJsaLocation(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="micro-label">STEP-BY-STEP OPERATION SEQUENCE</span>
                {jsaSteps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 w-8">#{idx + 1}</span>
                    <input
                      type="text"
                      value={s.step_description}
                      onChange={(e) => {
                        const updated = [...jsaSteps];
                        updated[idx].step_description = e.target.value;
                        setJsaSteps(updated);
                      }}
                      placeholder="e.g. Inspect rigging slings, secure load, clear landing perimeter"
                      className="flex-1 bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                    {jsaSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setJsaSteps(jsaSteps.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-700 text-xs px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. SAFETY PLAN (HASP) */}
          {docType === 'safety_plan' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="border-b border-[#E2E4E8] pb-3">
                <span className="micro-label">HEALTH &amp; SAFETY PROGRAM</span>
                <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                  2. Site Safety Plan (HASP) Parameters
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="md:col-span-2">
                  <label className="block text-neutral-600 font-medium mb-1">PROJECT SCOPE DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={projectScope}
                    onChange={(e) => setProjectScope(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">DESIGNATED SAFETY OFFICER</label>
                  <input
                    type="text"
                    value={safetyOfficer}
                    onChange={(e) => setSafetyOfficer(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">PROJECT DURATION (WEEKS)</label>
                  <input
                    type="number"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-neutral-600 font-medium text-xs mb-2">APPLICABLE SITE HAZARD PROTOCOLS</label>
                <div className="flex flex-wrap gap-2">
                  {['Fall Protection', 'Electrical Safety', 'Excavation & Trenching', 'PPE Standards', 'Scaffolding Safety', 'Hazard Communication', 'Hot Work Permit'].map((hz) => {
                    const active = selectedHazards.includes(hz);
                    return (
                      <button
                        key={hz}
                        type="button"
                        onClick={() => {
                          if (active) setSelectedHazards(selectedHazards.filter((h) => h !== hz));
                          else setSelectedHazards([...selectedHazards, hz]);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                          active
                            ? 'bg-orange-50 border-orange-200 text-[#F97316] font-semibold'
                            : 'bg-neutral-50 border-[#E2E4E8] text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {active ? '✓ ' : '+ '} {hz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* D. QUOTE */}
          {docType === 'quote' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
                <div>
                  <span className="micro-label">FINANCIAL ENGINE</span>
                  <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                    2. Estimating Inputs (Deterministic Math Engine)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteLineItems([...quoteLineItems, { description: 'New Material Item', quantity: 1, unit_cost: 100 }])}
                  className="px-3 py-1.5 bg-neutral-50 hover:bg-white border border-[#E2E4E8] text-neutral-800 text-xs font-mono font-medium rounded-xl transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  {quoteLineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 text-xs font-mono bg-neutral-50 p-2.5 rounded-xl border border-[#E2E4E8]">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const next = [...quoteLineItems];
                          next[idx].description = e.target.value;
                          setQuoteLineItems(next);
                        }}
                        placeholder="Material or Equipment Description"
                        className="col-span-7 bg-white border border-[#E2E4E8] rounded-lg px-2.5 py-1.5 text-neutral-900 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...quoteLineItems];
                          next[idx].quantity = Number(e.target.value);
                          setQuoteLineItems(next);
                        }}
                        placeholder="Qty"
                        className="col-span-2 bg-white border border-[#E2E4E8] rounded-lg text-center px-1 py-1.5 text-neutral-900 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={item.unit_cost}
                        onChange={(e) => {
                          const next = [...quoteLineItems];
                          next[idx].unit_cost = Number(e.target.value);
                          setQuoteLineItems(next);
                        }}
                        placeholder="Unit ($)"
                        className="col-span-2 bg-white border border-[#E2E4E8] rounded-lg text-right px-2 py-1.5 text-neutral-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuoteLineItems(quoteLineItems.filter((_, i) => i !== idx))}
                        className="col-span-1 text-rose-600 hover:text-rose-700 font-bold text-center self-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Labor & Margin Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-mono">
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">LABOR HOURS</label>
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value))}
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">BURDEN RATE ($/HR)</label>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(Number(e.target.value))}
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">OVERHEAD (%)</label>
                    <input
                      type="number"
                      value={overheadPct}
                      onChange={(e) => setOverheadPct(Number(e.target.value))}
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 font-medium mb-1">TARGET MARGIN (%)</label>
                    <input
                      type="number"
                      value={targetMarginPct}
                      onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                      className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Real-Time Live Math Preview */}
                <div className="bg-neutral-50 border border-[#E2E4E8] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">DIRECT MATERIALS</div>
                    <div className="text-sm font-bold text-neutral-900">${quoteMath.subtotal_materials.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">DIRECT LABOR</div>
                    <div className="text-sm font-bold text-neutral-900">${quoteMath.subtotal_labor.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase">TOTAL DIRECT COST</div>
                    <div className="text-sm font-bold text-neutral-900">${quoteMath.direct_cost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#F97316] font-bold uppercase">PROPOSAL CONTRACT PRICE</div>
                    <div className="text-lg font-black text-[#F97316]">${quoteMath.contract_price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. CHANGE ORDER */}
          {docType === 'change_order' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="border-b border-[#E2E4E8] pb-3">
                <span className="micro-label">CONTRACT ACCOUNTING</span>
                <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                  2. Change Order Parameters &amp; Schedule Delta
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">CHANGE ORDER #</label>
                  <input
                    type="text"
                    value={coNumber}
                    onChange={(e) => setCoNumber(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">ORIGINAL CONTRACT SUM ($)</label>
                  <input
                    type="number"
                    value={origContractSum}
                    onChange={(e) => setOrigContractSum(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">PRIOR APPROVED COs ($)</label>
                  <input
                    type="number"
                    value={priorCoSum}
                    onChange={(e) => setPriorCoSum(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Real-Time Live Change Order Delta Preview */}
              <div className="bg-neutral-50 border border-[#E2E4E8] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">PRIOR CONTRACT SUM</div>
                  <div className="text-sm font-bold text-neutral-900">${coMath.revised_contract_sum_before.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase">NET CO DELTA</div>
                  <div className="text-sm font-bold text-emerald-600">+${coMath.net_change_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase">SCHEDULE EXTENSION</div>
                  <div className="text-sm font-bold text-neutral-900">+{coMath.time_extension_calendar_days} Days</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#F97316] font-bold uppercase">REVISED CONTRACT TOTAL</div>
                  <div className="text-lg font-black text-[#F97316]">${coMath.new_contract_sum.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* F. TOOLBOX TALK */}
          {docType === 'toolbox_talk' && (
            <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="border-b border-[#E2E4E8] pb-3">
                <span className="micro-label">FIELD BRIEFING</span>
                <h2 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                  2. Safety Topic &amp; Field Parameters
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">SAFETY TOPIC</label>
                  <input
                    type="text"
                    value={toolboxTopic}
                    onChange={(e) => setToolboxTopic(e.target.value)}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">DURATION (MINUTES)</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                  >
                    <option value={5}>5 Minutes (Quick Tailgate)</option>
                    <option value={10}>10 Minutes (Standard Weekly Briefing)</option>
                    <option value={15}>15 Minutes (Comprehensive Hazard Review)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/workspace/create"
              className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-[#E2E4E8] text-xs font-medium text-neutral-700 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin text-sm">↻</span>
                  <span>Generating AI Document...</span>
                </>
              ) : (
                <>
                  <span>Generate Document</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW GENERATED DOCUMENT & SIGN */}
      {step === 2 && generatedDoc && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E4E8] pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-md uppercase">
                  GENERATION SUCCESSFUL • SCHEMA VALIDATED
                </span>
                <h2 className="font-display text-lg font-bold text-neutral-900 mt-1">
                  {generatedDoc.title}
                </h2>
                <div className="text-xs font-mono text-neutral-500">
                  Version: v{generatedDoc.version} | Generated By: {generatedDoc.generated_by.toUpperCase()}
                </div>
              </div>

              <a
                href={`/api/documents/${generatedDoc.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Download PDF</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>

            {/* Document Content Preview Box */}
            <div className="bg-neutral-50 border border-[#E2E4E8] rounded-2xl p-4 font-mono text-xs text-neutral-800 max-h-96 overflow-y-auto space-y-3">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {JSON.stringify(generatedDoc.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Digital Signature Execution Section */}
          <div className="bg-white border border-[#E2E4E8] rounded-[20px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="border-b border-[#E2E4E8] pb-3">
              <span className="micro-label">DIGITAL EXECUTION</span>
              <h3 className="font-display text-sm font-bold text-neutral-900 tracking-tight mt-0.5">
                Execute &amp; Cryptographically Lock Document
              </h3>
            </div>

            {signatureError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800">
                <span className="flex-1">{signatureError}</span>
                <button
                  type="button"
                  onClick={() => setSignatureError(null)}
                  className="text-rose-600 hover:text-rose-800 uppercase font-bold text-[10px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-mono text-neutral-600 font-medium">SIGNER LEGAL NAME</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:bg-white focus:border-[#F97316] focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-neutral-500 font-mono leading-relaxed">
                  By executing this document digitally, you confirm that safety controls and scope descriptions have been reviewed and approved. A cryptographically hashed audit entry (SHA-256) will be recorded.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>DRAW SIGNATURE BELOW:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-neutral-500 hover:text-neutral-900 font-medium"
                  >
                    Clear Canvas
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full bg-neutral-50 border border-[#E2E4E8] rounded-xl cursor-crosshair h-28"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E4E8]">
              <Link
                href="/workspace/documents"
                className="px-4 py-2 bg-white hover:bg-neutral-50 border border-[#E2E4E8] text-xs font-medium text-neutral-700 rounded-xl transition-colors"
              >
                Save as Draft (Unsigned)
              </Link>
              <button
                type="button"
                disabled={isSigning || !signerName}
                onClick={handleSign}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                {isSigning ? 'Hashing & Locking...' : 'Sign & Lock Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT EXECUTED & LOCKED */}
      {step === 3 && generatedDoc && (
        <div className="bg-white border border-emerald-200 rounded-[20px] p-8 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-300 text-emerald-600 rounded-full mx-auto flex items-center justify-center font-bold text-xl">
            ✓
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-neutral-900">
              Document Executed &amp; Cryptographically Locked
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Signed by {signerName} • SHA-256 IP Hash Recorded • Immutable Ledger Entry
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 font-mono text-xs">
            <a
              href={`/api/documents/${generatedDoc.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl shadow-xs transition-colors"
            >
              Download Signed PDF
            </a>
            <Link
              href={`/workspace/documents/${generatedDoc.id}`}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-xl transition-colors"
            >
              View Document Details &amp; History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
