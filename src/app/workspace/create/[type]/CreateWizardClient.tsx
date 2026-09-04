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
  const [generatedDoc, setGeneratedDoc] = useState<WorkspaceDocument | null>(null);

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
    ctx.strokeStyle = '#0ea5e9';
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
        throw new Error(data.error || 'Failed to generate document');
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
      <div className="bg-[#090d16] border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/workspace/create" className="text-xs font-mono text-slate-500 hover:text-sky-400 transition-colors uppercase">
              ← Create Studio
            </Link>
            <span className="text-slate-700">/</span>
            <span className="font-mono text-xs font-bold text-sky-400 uppercase">
              {docTitleMap[docType]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {step === 1 ? `Configure ${docTitleMap[docType]}` : step === 2 ? 'Review & Execute Document' : 'Document Executed & Stored'}
          </h1>
        </div>

        {/* Step Numbers */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className={`px-3 py-1.5 border font-bold ${step === 1 ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            1. SPECIFY
          </div>
          <div className="text-slate-700">→</div>
          <div className={`px-3 py-1.5 border font-bold ${step === 2 ? 'bg-sky-950 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            2. REVIEW
          </div>
          <div className="text-slate-700">→</div>
          <div className={`px-3 py-1.5 border font-bold ${step === 3 ? 'bg-emerald-950 border-emerald-600 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            3. SIGN & EXPORT
          </div>
        </div>
      </div>

      {generationError && (
        <div className="bg-red-950/60 border border-red-800 p-4 font-mono text-xs text-red-300">
          <span className="font-bold">GENERATION FAILURE:</span> {generationError}
        </div>
      )}

      {/* STEP 1: STRUCTURED CONFIGURATION FORM */}
      {step === 1 && (
        <div className="space-y-6">
          {/* General Project Metadata Box */}
          <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. PROJECT & SITE IDENTIFIERS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Westside Medical Center Overhaul"
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SITE ADDRESS</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="e.g. 742 Healthcare Blvd, Suite 200"
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">TRADE / DISCIPLINE</label>
                <input
                  type="text"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">EFFECTIVE DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* DOCUMENT-SPECIFIC STRUCTURED SECTIONS */}
          {docType === 'jha' && (
            <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. TASK BREAKDOWN & HAZARDS (OSHA HIERARCHY OF CONTROLS)
                </h2>
                <button
                  type="button"
                  onClick={() => setJhaTasks([...jhaTasks, { task_description: '', equipment_materials: '', hazard_type: 'Struck-by' }])}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-[11px] font-mono uppercase"
                >
                  + Add Task Step
                </button>
              </div>

              <div className="space-y-4">
                {jhaTasks.map((t, idx) => (
                  <div key={idx} className="bg-[#030712] border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs text-sky-400">
                      <span>STEP {idx + 1}</span>
                      {jhaTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setJhaTasks(jhaTasks.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 text-[10px] uppercase"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 mb-1">TASK DESCRIPTION</label>
                        <input
                          type="text"
                          value={t.task_description}
                          onChange={(e) => {
                            const updated = [...jhaTasks];
                            updated[idx].task_description = e.target.value;
                            setJhaTasks(updated);
                          }}
                          placeholder="e.g. Core drilling 4-inch penetrations in concrete slab"
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">PRIMARY HAZARD</label>
                        <select
                          value={t.hazard_type}
                          onChange={(e) => {
                            const updated = [...jhaTasks];
                            updated[idx].hazard_type = e.target.value;
                            setJhaTasks(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:outline-none"
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

          {docType === 'quote' && (
            <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
              <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                2. ESTIMATING INPUTS (DETERMINISTIC FINANCIAL ENGINE)
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">LINE ITEMS & DIRECT MATERIALS</span>
                  <button
                    type="button"
                    onClick={() => setQuoteLineItems([...quoteLineItems, { description: 'New Material Item', quantity: 1, unit_cost: 100 }])}
                    className="px-2 py-1 bg-slate-900 border border-slate-700 text-sky-400 text-[10px] font-mono uppercase"
                  >
                    + Add Item
                  </button>
                </div>

                {quoteLineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 text-xs font-mono bg-[#030712] p-2 border border-slate-800">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const next = [...quoteLineItems];
                        next[idx].description = e.target.value;
                        setQuoteLineItems(next);
                      }}
                      className="col-span-7 bg-transparent border-0 text-slate-200 px-2 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...quoteLineItems];
                        next[idx].quantity = Number(e.target.value);
                        setQuoteLineItems(next);
                      }}
                      className="col-span-2 bg-slate-950 border border-slate-800 text-center px-1"
                    />
                    <input
                      type="number"
                      value={item.unit_cost}
                      onChange={(e) => {
                        const next = [...quoteLineItems];
                        next[idx].unit_cost = Number(e.target.value);
                        setQuoteLineItems(next);
                      }}
                      className="col-span-2 bg-slate-950 border border-slate-800 text-right px-2"
                    />
                    <button
                      type="button"
                      onClick={() => setQuoteLineItems(quoteLineItems.filter((_, i) => i !== idx))}
                      className="col-span-1 text-red-400 text-center"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Labor & Margin Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-mono">
                  <div>
                    <label className="block text-slate-500 mb-1">LABOR HOURS</label>
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value))}
                      className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">BURDEN RATE ($/HR)</label>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(Number(e.target.value))}
                      className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">OVERHEAD (%)</label>
                    <input
                      type="number"
                      value={overheadPct}
                      onChange={(e) => setOverheadPct(Number(e.target.value))}
                      className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">TARGET MARGIN (%)</label>
                    <input
                      type="number"
                      value={targetMarginPct}
                      onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                      className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                    />
                  </div>
                </div>

                {/* Real-Time Live Math Preview */}
                <div className="bg-[#030712] border border-sky-900/60 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">DIRECT MATERIALS</div>
                    <div className="text-sm font-bold text-slate-200">${quoteMath.subtotal_materials.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">DIRECT LABOR</div>
                    <div className="text-sm font-bold text-slate-200">${quoteMath.subtotal_labor.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">TOTAL DIRECT COST</div>
                    <div className="text-sm font-bold text-slate-200">${quoteMath.direct_cost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-sky-400 font-bold uppercase">PROPOSAL CONTRACT PRICE</div>
                    <div className="text-lg font-black text-sky-400">${quoteMath.contract_price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {docType === 'change_order' && (
            <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
              <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                2. CHANGE ORDER CONTRACT ACCOUNTING
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-500 mb-1">CHANGE ORDER #</label>
                  <input
                    type="text"
                    value={coNumber}
                    onChange={(e) => setCoNumber(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">ORIGINAL CONTRACT SUM ($)</label>
                  <input
                    type="number"
                    value={origContractSum}
                    onChange={(e) => setOrigContractSum(Number(e.target.value))}
                    className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">PRIOR APPROVED COs ($)</label>
                  <input
                    type="number"
                    value={priorCoSum}
                    onChange={(e) => setPriorCoSum(Number(e.target.value))}
                    className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Real-Time Live Change Order Delta Preview */}
              <div className="bg-[#030712] border border-emerald-900/60 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">PRIOR CONTRACT SUM</div>
                  <div className="text-sm font-bold text-slate-200">${coMath.revised_contract_sum_before.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 uppercase">NET CO DELTA</div>
                  <div className="text-sm font-bold text-emerald-400">+${coMath.net_change_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">SCHEDULE EXTENSION</div>
                  <div className="text-sm font-bold text-slate-200">+{coMath.time_extension_calendar_days} Calendar Days</div>
                </div>
                <div>
                  <div className="text-[10px] text-sky-400 font-bold uppercase">REVISED CONTRACT TOTAL</div>
                  <div className="text-lg font-black text-sky-400">${coMath.new_contract_sum.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {docType === 'toolbox_talk' && (
            <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
              <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                2. SAFETY TOPIC & FIELD PARAMETERS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">SAFETY TOPIC</label>
                  <input
                    type="text"
                    value={toolboxTopic}
                    onChange={(e) => setToolboxTopic(e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">DURATION (MINUTES)</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
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
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/workspace/create"
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400 hover:text-white uppercase"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2"
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
          <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase">
                  GENERATION SUCCESSFUL • SCHEMA VALIDATED
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  {generatedDoc.title}
                </h2>
                <div className="text-xs font-mono text-slate-400">
                  Version: v{generatedDoc.version} | Generated By: {generatedDoc.generated_by.toUpperCase()}
                </div>
              </div>

              <a
                href={`/api/documents/${generatedDoc.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Download PDF</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>

            {/* Document Content Preview Box */}
            <div className="bg-[#030712] border border-slate-800 p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto space-y-3">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {JSON.stringify(generatedDoc.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Digital Signature Execution Section */}
          <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              DIGITAL SIGNATURE EXECUTION (LOCKS DOCUMENT AS READ-ONLY)
            </h3>

            {signatureError && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300">
                <svg className="w-4 h-4 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span className="flex-1">{signatureError}</span>
                <button
                  type="button"
                  onClick={() => setSignatureError(null)}
                  className="text-red-400 hover:text-red-200 uppercase font-bold text-[10px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-mono text-slate-400">SIGNER LEGAL NAME</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  By executing this document digitally, you confirm that safety controls and scope descriptions have been reviewed and approved. A cryptographically hashed audit entry (SHA-256) will be recorded.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>DRAW SIGNATURE BELOW:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-slate-500 hover:text-slate-300 uppercase"
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
                  className="w-full bg-[#030712] border border-slate-700 cursor-crosshair h-28"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Link
                href="/workspace/documents"
                className="px-4 py-2 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400 uppercase"
              >
                Save as Draft (Unsigned)
              </Link>
              <button
                type="button"
                disabled={isSigning || !signerName}
                onClick={handleSign}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors"
              >
                {isSigning ? 'Hashing & Locking...' : 'Sign & Lock Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT EXECUTED & LOCKED */}
      {step === 3 && generatedDoc && (
        <div className="bg-[#090d16] border border-emerald-900/60 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-950 border border-emerald-700 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Document Executed & Cryptographically Locked
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Signed by {signerName} • SHA-256 IP Hash Recorded • Immutable Ledger Entry
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 font-mono text-xs">
            <a
              href={`/api/documents/${generatedDoc.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold uppercase tracking-wider"
            >
              Download Signed PDF
            </a>
            <Link
              href={`/workspace/documents/${generatedDoc.id}`}
              className="px-5 py-2.5 bg-slate-900 border border-slate-700 text-slate-200 hover:text-white uppercase font-bold tracking-wider"
            >
              View Document Details & History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
