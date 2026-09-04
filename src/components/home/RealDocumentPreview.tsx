'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Check
} from 'lucide-react';

export function RealContractorDocumentPreview() {
  const [activeDoc, setActiveDoc] = useState<'jha' | 'sow'>('jha');

  return (
    <div className="w-full font-['Work_Sans',sans-serif] font-extralight">
      {/* ── Outer Dashboard Viewer Frame ── */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden ring-1 ring-white/10 font-extralight">
        
        {/* Top Studio Chrome / App Header */}
        <div className="bg-[#090d16] border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-extralight">
          {/* Left: App breadcrumb & doc status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#38bdf8]">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-400 font-extralight">
                Avorria Studio <span className="text-slate-600">/</span> <span className="text-slate-200">{activeDoc === 'jha' ? 'JHA-2026-0884' : 'PROP-2026-0419'}</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extralight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FINALIZED & VERIFIED
            </span>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Document Selector Pills */}
            <div className="bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg flex items-center text-[11px]">
              <button
                type="button"
                onClick={() => setActiveDoc('jha')}
                className={`px-2.5 py-1 rounded-md transition-all font-extralight ${
                  activeDoc === 'jha'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety JHA
              </button>
              <button
                type="button"
                onClick={() => setActiveDoc('sow')}
                className={`px-2.5 py-1 rounded-md transition-all font-extralight ${
                  activeDoc === 'sow'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Commercial SOW
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                title="Download PDF"
                className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Print Document"
                className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Share with General Contractor"
                className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors border border-transparent hover:border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Document Canvas Background ── */}
        <div className="bg-[#1e293b]/70 p-3 sm:p-6 lg:p-7 overflow-x-auto font-extralight">
          {/* ── Physical Sheet (White Paper Effect) ── */}
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200/90 max-w-[850px] mx-auto relative overflow-hidden font-extralight">
            
            {/* Sheet Top Security & Revision Strip */}
            <div className="bg-slate-900 text-white px-5 sm:px-8 py-2 flex flex-wrap items-center justify-between text-[10px] font-extralight tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-[#38bdf8]">AVORRIA SECURE DOCUMENT ENGINE</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">IMMUTABLE COMPLIANCE LEDGER</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>REF: {activeDoc === 'jha' ? 'AVR-JHA-2026-0884' : 'AVR-PROP-2026-0419'}</span>
                <span>REV 2.0</span>
                <span>PAGE 1 OF 2</span>
              </div>
            </div>

            {/* Document Content Area */}
            <div className="p-5 sm:p-8 space-y-5 font-extralight">
              
              {/* 1. CONTRACTOR LETTERHEAD & VERIFICATION BLOCK */}
              <div className="pb-4 border-b-2 border-slate-900 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Contractor Identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-navy-900 flex items-center justify-center text-white text-sm shadow-sm border border-slate-700 font-extralight">
                      <span className="tracking-tight text-white">VE</span>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg text-slate-900 tracking-tight uppercase leading-tight font-extralight">
                        Vance Commercial Electrical, LLC
                      </div>
                      <div className="text-[11px] text-slate-500 font-extralight">
                        Austin Regional Office • 4801 Freidrich Ln, Suite 200, Austin, TX 78744
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600 font-extralight pt-1">
                    <span><span className="text-slate-800">TX Master Lic:</span> #TX-984210</span>
                    <span>•</span>
                    <span><span className="text-slate-800">DIR Registration:</span> #10008472</span>
                    <span>•</span>
                    <span><span className="text-slate-800">Insurance:</span> Travelers $2M Policy #US-GL-9920144</span>
                  </div>
                </div>

                {/* Avorria Verification QR & Hash Stamp */}
                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 p-2.5 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                      {/* Stylized QR Code SVG */}
                      <svg className="w-8 h-8 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h4v2h-4v-2zm6 0h2v2h-2v-2zm-6 4h2v4h-2v-4zm4 0h2v2h-2v-2zm-8-6h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-left sm:text-right text-[9px] font-extralight space-y-0.5">
                      <div className="text-emerald-700 flex items-center sm:justify-end gap-1 font-extralight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>AV-VER-984210</span>
                      </div>
                      <div className="text-slate-500">Avorria Digital Trust</div>
                      <div className="text-slate-400">Signed: 2026-09-04 06:45 CST</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. DOCUMENT TYPE BANNER & REGULATORY CODE */}
              {activeDoc === 'jha' ? (
                <div>
                  <div className="bg-navy-950 text-white p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-extralight">
                        Field Safety & Hazard Mitigation Plan
                      </div>
                      <div className="text-sm sm:text-base text-white tracking-tight mt-0.5 font-extralight">
                        Job Hazard Analysis (JHA): 480V Substation Feeder Pulling & Terminations
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30 font-extralight">
                        OSHA 1926 Subpart K • NFPA 70E
                      </span>
                    </div>
                  </div>

                  {/* 3. PROJECT CONTEXT MATRIX (4 Key Fields) */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 font-extralight">
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Project</span>
                      <span className="text-slate-800 block truncate" title="Dell Children's Hospital Expansion">
                        Dell Children’s Hospital Expansion
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">General Contractor</span>
                      <span className="text-slate-800 block truncate" title="Austin Commercial / DPR JV">
                        Austin Commercial / DPR JV
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Location</span>
                      <span className="text-slate-800 block truncate">
                        Vault B-2 (Level -1 Switchgear)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Permit / LOTO Tag</span>
                      <span className="text-emerald-700 block truncate">
                        #EEP-2026-042 • Active
                      </span>
                    </div>
                  </div>

                  {/* 4. MANDATORY PPE REQUIREMENT BAR */}
                  <div className="mt-3 p-2 rounded bg-amber-50/70 border border-amber-200/80 font-extralight">
                    <div className="text-[9px] uppercase tracking-wider text-amber-800 mb-1.5 flex items-center gap-1 font-extralight">
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      <span>Mandatory PPE Category 4 Checklist (NFPA 70E Standard)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[9.5px]">
                      <span className="px-2 py-0.5 rounded bg-white border border-amber-300/80 text-amber-950 flex items-center gap-1 font-extralight">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2]" /> 40 cal/cm² Arc Flash Hood
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-amber-300/80 text-amber-950 flex items-center gap-1 font-extralight">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2]" /> 1,000V ASTM Insulated Tools
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-amber-300/80 text-amber-950 flex items-center gap-1 font-extralight">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2]" /> ASTM F2413 EH Boots
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-amber-300/80 text-amber-950 flex items-center gap-1 font-extralight">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2]" /> Fluke 87V CAT IV Multimeter
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-amber-300/80 text-amber-950 flex items-center gap-1 font-extralight">
                        <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2]" /> Class E Hard Hat
                      </span>
                    </div>
                  </div>

                  {/* 5. HAZARD & CONTROL SEQUENCE TABLE */}
                  <div className="mt-3.5 space-y-1.5 font-extralight">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-slate-700 font-extralight">
                        Task Hazard Analysis & Engineering Controls
                      </div>
                      <span className="text-[9px] text-slate-400 font-extralight">3 High-Risk Sequences Evaluated</span>
                    </div>

                    <div className="border border-slate-300 rounded overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10.5px] font-extralight">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 text-[9.5px] font-extralight">
                          <tr>
                            <th className="p-2 w-[28%] font-extralight">Sequence of Work</th>
                            <th className="p-2 w-[24%] font-extralight">Identified Hazards</th>
                            <th className="p-2 w-[12%] font-extralight">Risk Level</th>
                            <th className="p-2 w-[36%] font-extralight">Required Controls & Safety Rule</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-extralight">
                          <tr className="bg-white hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 align-top font-extralight">
                              <span className="text-slate-500 font-extralight">01.</span> LOTO Isolation on 480V Switchboard MSB-1
                            </td>
                            <td className="p-2 text-rose-700 align-top font-extralight">
                              Arc flash (Cat 4), electrocution & backfeed
                            </td>
                            <td className="p-2 align-top">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-extralight">
                                HIGH IV
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 align-top leading-relaxed text-[10px] font-extralight">
                              Apply master lockout hasp + crew padlock. Live-dead-live test with calibrated Fluke 87V phase-to-phase & phase-to-ground. Witnessed by DPR Safety Officer.
                            </td>
                          </tr>
                          <tr className="bg-slate-50/30 hover:bg-slate-50/80">
                            <td className="p-2 text-slate-900 align-top font-extralight">
                              <span className="text-slate-500 font-extralight">02.</span> 500 MCM Copper Feeder Tugger Rigging
                            </td>
                            <td className="p-2 text-amber-700 align-top font-extralight">
                              Rope snapback, pinch points at sheaves
                            </td>
                            <td className="p-2 align-top">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extralight">
                                MODERATE
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 align-top leading-relaxed text-[10px] font-extralight">
                              Greenlee 6001 tugger bolted with load pins. Tension limiter set to 6,000 lbs max. Remote foot switch operated by lead puller. Stand clear of pull radius.
                            </td>
                          </tr>
                          <tr className="bg-white hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 align-top font-extralight">
                              <span className="text-slate-500 font-extralight">03.</span> Stress Cone Terminations & Hi-Pot Testing
                            </td>
                            <td className="p-2 text-sky-700 align-top font-extralight">
                              Sharp stripping blades & 5kV test surge
                            </td>
                            <td className="p-2 align-top">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-extralight">
                                CONTROLLED
                              </span>
                            </td>
                            <td className="p-2 text-slate-600 align-top leading-relaxed text-[10px] font-extralight">
                              ANSI A4 cut-resistant Kevlar gloves for cable prep. 100 ft safety exclusion zone with danger tape during high-potential insulation resistance test.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 6. EMERGENCY RESPONSE & MUSTER CONTACTS */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 font-extralight">
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Nearest Trauma Center</span>
                      <span className="text-slate-800 block font-extralight">Dell Seton Medical (1.8 mi / 5 min)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Certified CPR / First Aid</span>
                      <span className="text-slate-800 block font-extralight">David Morales (#FA-8821)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Emergency Muster Point</span>
                      <span className="text-slate-800 block font-extralight">Assembly Area C (East Gate)</span>
                    </div>
                  </div>

                  {/* 7. DIGITAL CREW SIGN-OFF & GC AUDIT ROSTER */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200 font-extralight">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-700 font-extralight">
                        Tailgate Safety Briefing & Digital Crew Sign-Off
                      </div>
                      <span className="text-[9px] text-emerald-700 flex items-center gap-1 font-extralight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        4 of 4 Signatures Recorded
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-extralight">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[9px] text-slate-400 uppercase">Competent Person / Lead</div>
                        <div className="italic text-slate-900 text-[13px] tracking-wide text-navy-950 font-extralight">
                          Marcus Vance
                        </div>
                        <div className="text-[8.5px] text-slate-500 font-extralight">Master Lic #TX-98765 • 06:45 AM</div>
                      </div>

                      <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[9px] text-slate-400 uppercase">Journeyman Electrician</div>
                        <div className="italic text-slate-900 text-[13px] tracking-wide text-navy-950 font-extralight">
                          David Morales
                        </div>
                        <div className="text-[8.5px] text-slate-500 font-extralight">Journeyman #TX-44102 • 06:48 AM</div>
                      </div>

                      <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[9px] text-slate-400 uppercase">Apprentice (3rd Yr)</div>
                        <div className="italic text-slate-900 text-[13px] tracking-wide text-navy-950 font-extralight">
                          Tyler Brooks
                        </div>
                        <div className="text-[8.5px] text-slate-500 font-extralight">Apprentice #TX-89104 • 06:50 AM</div>
                      </div>

                      <div className="p-2 rounded bg-emerald-50/70 border border-emerald-300/80 space-y-1">
                        <div className="text-[9px] text-emerald-800 uppercase font-extralight">GC Safety Inspector</div>
                        <div className="italic text-emerald-950 text-[13px] tracking-wide font-extralight">
                          Sarah Jenkins
                        </div>
                        <div className="text-[8.5px] text-emerald-700 font-extralight">DPR JV Safety • 07:10 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ALTERNATIVE DOCUMENT: COMMERCIAL PROPOSAL / SOW */
                <div className="font-extralight">
                  <div className="bg-navy-950 text-white p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-extralight">
                        Commercial Proposal & Scope of Work
                      </div>
                      <div className="text-sm sm:text-base text-white tracking-tight mt-0.5 font-extralight">
                        Substation Switchboard Upgrade & Arc Flash Coordination
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30 font-extralight">
                        AIA G702/G703 Structured
                      </span>
                    </div>
                  </div>

                  {/* Commercial Project Meta */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded border border-slate-200 font-extralight">
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Client</span>
                      <span className="text-slate-800 block truncate font-extralight">Hensel Phelps Construction Co.</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Project</span>
                      <span className="text-slate-800 block truncate font-extralight">Travis County Health Lab</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Payment Terms</span>
                      <span className="text-slate-800 block truncate font-extralight">Net 30 • 5% Retainage</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[9px]">Proposal Validity</span>
                      <span className="text-emerald-700 block truncate font-extralight">60 Days (Guaranteed)</span>
                    </div>
                  </div>

                  {/* Line Item Schedule Table */}
                  <div className="mt-3.5 space-y-1.5 font-extralight">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider text-slate-700 font-extralight">
                        Itemized Scope & Cost Breakdown
                      </div>
                      <span className="text-[9px] text-slate-400 font-extralight">Fixed-Price Commercial Bid</span>
                    </div>

                    <div className="border border-slate-300 rounded overflow-hidden">
                      <table className="w-full text-left border-collapse text-[10.5px] font-extralight">
                        <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 text-[9.5px] font-extralight">
                          <tr>
                            <th className="p-2 w-[12%] font-extralight">Item #</th>
                            <th className="p-2 w-[48%] font-extralight">Description of Work / Deliverable</th>
                            <th className="p-2 w-[18%] font-extralight">Qty / Unit</th>
                            <th className="p-2 w-[22%] text-right font-extralight">Total Amount (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-extralight">
                          <tr className="bg-white">
                            <td className="p-2 text-slate-500 font-extralight">01.00</td>
                            <td className="p-2 text-slate-900 font-extralight">Demolition & safe environmental disposal of legacy 1600A switchboard</td>
                            <td className="p-2 text-slate-600 text-[10px] font-extralight">1 Lump Sum</td>
                            <td className="p-2 text-slate-900 text-right font-extralight">$18,400.00</td>
                          </tr>
                          <tr className="bg-slate-50/40">
                            <td className="p-2 text-slate-500 font-extralight">02.00</td>
                            <td className="p-2 text-slate-900 font-extralight">Square D 2500A 480V NEMA 3R main service switchboard delivery & rigging</td>
                            <td className="p-2 text-slate-600 text-[10px] font-extralight">1 Complete Unit</td>
                            <td className="p-2 text-slate-900 text-right font-extralight">$94,500.00</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2 text-slate-500 font-extralight">03.00</td>
                            <td className="p-2 text-slate-900 font-extralight">500 MCM Copper Feeder Runs (4x parallel conduits in 4" rigid EMT)</td>
                            <td className="p-2 text-slate-600 text-[10px] font-extralight">1,200 Lin. Ft</td>
                            <td className="p-2 text-slate-900 text-right font-extralight">$48,600.00</td>
                          </tr>
                          <tr className="bg-slate-50/40">
                            <td className="p-2 text-slate-500 font-extralight">04.00</td>
                            <td className="p-2 text-slate-900 font-extralight">Engineering Arc Flash Study, Short Circuit Analysis & NFPA 70E Labeling</td>
                            <td className="p-2 text-slate-600 text-[10px] font-extralight">1 PE Study</td>
                            <td className="p-2 text-slate-900 text-right font-extralight">$7,500.00</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-100 border-t-2 border-slate-400 text-[11px] font-extralight">
                          <tr>
                            <td colSpan={3} className="p-2 text-right text-slate-700 uppercase font-extralight">
                              Guaranteed Maximum Price (GMP):
                            </td>
                            <td className="p-2 text-right text-slate-950 text-sm font-extralight">
                              $169,000.00
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Included Verified Credentials Callout */}
                  <div className="mt-3 p-2.5 rounded bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between font-extralight">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-[10px] text-slate-700 font-extralight">
                        <span className="text-slate-900 font-extralight">Avorria Verified Passport Attached:</span> General Liability ($2M), Statutory Workers’ Comp, and Texas Master License pre-verified for this bid.
                      </div>
                    </div>
                    <span className="text-emerald-800 text-[10px] shrink-0 hidden sm:inline font-extralight">
                      AV-VER-984210
                    </span>
                  </div>

                  {/* Sign-Off Strip */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 font-extralight">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[9px] text-slate-400 uppercase font-extralight">Contractor Authorized Representative</div>
                      <div className="italic text-slate-900 text-[13px] tracking-wide text-navy-950 font-extralight">
                        Marcus Vance
                      </div>
                      <div className="text-[8.5px] text-slate-500 font-extralight">Managing Partner, Vance Electrical • Sep 04, 2026</div>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[9px] text-slate-400 uppercase font-extralight">Client Acceptance & Notice to Proceed</div>
                      <div className="border-b border-dashed border-slate-300 pt-3" />
                      <div className="text-[8.5px] text-slate-400 font-extralight">Authorized Signature / Date</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Sheet Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-400 font-extralight">
                <div>Avorria Operating Platform • Document Hash: sha256:7f4c91a082e6...</div>
                <div className="text-slate-500">Official Field Record • Tamper-Evident Digital Audit Trail</div>
              </div>

            </div>
          </div>
        </div>

        {/* Studio Bottom Status Bar */}
        <div className="bg-[#090d16] border-t border-slate-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-extralight">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-[10.5px] font-extralight">Auto-saved to contractor vault (Cloud Synced)</span>
          </div>
          <div className="flex items-center gap-4 text-[10.5px] font-extralight">
            <span className="hidden sm:inline">Format: OSHA / AIA Compliant</span>
            <span className="text-slate-300 hover:text-[#38bdf8] cursor-pointer font-extralight">
              Export PDF (Ready for Site Inspection) →
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
