'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HazardStep {
  taskStep: string;
  hazardDescription: string;
  controlMeasures: string[];
  requiredPpe: string[];
  oshaSubpart: string;
}

const PRESET_HAZARDS: Record<string, HazardStep[]> = {
  'Electrical Contracting': [
    {
      taskStep: 'Main Feeder De-energization & Lockout/Tagout (LOTO)',
      hazardDescription: 'Electrical shock, stored capacitive energy, and arc flash hazard up to 40 cal/cm².',
      controlMeasures: [
        'Open upstream disconnect and apply individual red Master Lock with danger tag.',
        'Perform live-dead-live testing with calibrated Category IV 1000V multimeter.',
        'Verify zero mechanical or capacitive stored energy before installing ground clusters.',
      ],
      requiredPpe: ['NFPA 70E Category 4 Arc Flash Suit & Hood (40 cal/cm²)', 'Class 2 Dielectric Gloves (17,000V rated)', 'EH Safety Boots'],
      oshaSubpart: 'OSHA 29 CFR 1926 Subpart K (Electrical)',
    },
    {
      taskStep: 'Overhead Conduit Bending & Trapeze Hanger Installation',
      hazardDescription: 'Falls from height, falling tools, ergonomic strain, hand pinch points.',
      controlMeasures: [
        'Inspect scissor lift harness and anchor lanyard before elevation.',
        'Establish 10ft ground exclusion barricade below aerial work zone.',
        'Secure power tools with tool lanyards when working overhead.',
      ],
      requiredPpe: ['ANSI Z89.1 Class E Hard Hat', 'ANSI Z87.1 Safety Glasses with Side Shields', 'Cut-Resistant Level A4 Gloves'],
      oshaSubpart: 'OSHA 29 CFR 1926 Subpart M (Fall Protection)',
    },
  ],
  'HVAC & Mechanical': [
    {
      taskStep: 'Rooftop Package Chiller Rigging & Placement',
      hazardDescription: 'Dropped heavy load, crane boom contact with overhead power lines, structural collapse.',
      controlMeasures: [
        'Verify crane outriggers deployed on certified timber crane mats.',
        'Inspect wire rope slings and synthetic chokers prior to initial pick.',
        'Enforce minimum 20ft clearance boundary from all overhead power conductors.',
      ],
      requiredPpe: ['High-Visibility Safety Vest (Class 2)', 'Steel-Toe Boots (ASTM F2413)', 'Hard Hat Type I'],
      oshaSubpart: 'OSHA 29 CFR 1926 Subpart CC (Cranes & Derricks)',
    },
  ],
  'Concrete & Masonry': [
    {
      taskStep: 'Dry Masonry Sawing & Concrete Core Drilling',
      hazardDescription: 'Respirable crystalline silica dust inhalation, rotational kickback, high noise level.',
      controlMeasures: [
        'Utilize integrated wet-suppression water feed kit at all cutting heads.',
        'Equip core drill with HEPA-filtered vacuum extraction shroud.',
        'Enforce Table 1 engineering controls per OSHA 1926.1153.',
      ],
      requiredPpe: ['NIOSH N95 / Half-Mask Elastomeric Respirator', 'NRR 28dB Hearing Protection', 'Safety Goggles with Seal'],
      oshaSubpart: 'OSHA 29 CFR 1926.1153 (Respirable Crystalline Silica)',
    },
  ],
};

export function PublicJhaToolClient() {
  const [trade, setTrade] = useState('Electrical Contracting');
  const [projectName, setProjectName] = useState('Centennial Plaza Commercial Complex');
  const [competentPerson, setCompetentPerson] = useState('Marcus Vance, Lead Safety Supervisor');
  const [taskDescription, setTaskDescription] = useState('Switchgear replacement and heavy feeder wire pull');
  const [customControl, setCustomControl] = useState('');
  const [isGenerated, setIsGenerated] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const currentSteps = PRESET_HAZARDS[trade] || PRESET_HAZARDS['Electrical Contracting'];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setExportError(null);
    try {
      const res = await fetch('/api/resources/job-hazard-analysis-jha-generator/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            projectName,
            tradeScope: trade,
            competentPerson,
            taskDescription,
          },
          tableRows: currentSteps.map((s) => ({
            sequenceStep: s.taskStep,
            potentialHazards: s.hazardDescription,
            controlMeasures: s.controlMeasures.join('; '),
            requiredPpe: s.requiredPpe.join(', '),
          })),
        }),
      });
      if (!res.ok) throw new Error('PDF export failed — please try again');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SC-JHA-01_job-hazard-analysis.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message || 'PDF export failed');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    setExportError(null);
    try {
      const res = await fetch('/api/resources/job-hazard-analysis-jha-generator/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            projectName,
            tradeScope: trade,
            competentPerson,
            taskDescription,
          },
          tableRows: currentSteps.map((s) => ({
            sequenceStep: s.taskStep,
            potentialHazards: s.hazardDescription,
            controlMeasures: s.controlMeasures.join('; '),
            requiredPpe: s.requiredPpe.join(', '),
          })),
        }),
      });
      if (!res.ok) throw new Error('DOCX export failed — please try again');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SC-JHA-01_job-hazard-analysis.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err.message || 'Word export failed');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page text-navy-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3 print:hidden">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/resources" className="text-slate-500 hover:text-sky-600 uppercase font-bold tracking-wider">
              ← Resources Library
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sky-600 font-bold uppercase tracking-wider">Safety &amp; Compliance</span>
            <span className="text-slate-300">/</span>
            <span className="px-1.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 font-bold uppercase text-[10px] rounded-sm">
              OSHA 1926
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight text-navy-900 tracking-tight">
            Job Hazard Analysis (JHA) Generator
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Generate an OSHA 1926-aligned Job Hazard Analysis for pre-task planning. Break down scheduled work activities, identify physical hazards, enforce the hierarchy of controls, and generate clean jobsite documentation.
          </p>
        </div>

        {/* Input Configuration Card */}
        <div className="bg-white border border-slate-200 shadow-sm p-6 space-y-4 print:hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Task Configuration &amp; Project Context
            </h2>
            <span className="text-[11px] text-slate-400">Field Pre-Task Briefing Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase text-[11px]">Primary Trade Scope</label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-sky-500 px-3 py-2 text-slate-800 outline-none rounded-[4px]"
              >
                <option value="Electrical Contracting">Electrical Contracting</option>
                <option value="HVAC & Mechanical">HVAC &amp; Mechanical</option>
                <option value="Concrete & Masonry">Concrete &amp; Masonry</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase text-[11px]">Project / Jobsite Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-sky-500 px-3 py-2 text-slate-800 outline-none rounded-[4px]"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase text-[11px]">Competent Person / Lead Supervisor</label>
              <input
                type="text"
                value={competentPerson}
                onChange={(e) => setCompetentPerson(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-sky-500 px-3 py-2 text-slate-800 outline-none rounded-[4px]"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase text-[11px]">Specific Task Description</label>
              <input
                type="text"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-sky-500 px-3 py-2 text-slate-800 outline-none rounded-[4px]"
              />
            </div>
          </div>

          {exportError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[4px] flex items-center justify-between">
              <span>{exportError}</span>
              <button
                type="button"
                onClick={() => setExportError(null)}
                className="text-red-500 hover:text-red-700 uppercase font-bold text-[10px]"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/resources/job-hazard-analysis-jha-generator"
              className="text-xs text-sky-700 hover:text-sky-900 font-medium"
            >
              Open in Full Interactive Resource Workspace →
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isExportingPdf}
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px] flex items-center gap-1.5"
              >
                {isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}
              </button>
              <button
                type="button"
                disabled={isExportingDocx}
                onClick={handleDownloadDocx}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px] flex items-center gap-1.5"
              >
                {isExportingDocx ? 'Exporting Word...' : 'Download Word (.docx)'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
              >
                Print / Browser PDF
              </button>
            </div>
          </div>
        </div>

        {/* Formatted Commercial Document Output */}
        <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  JOB HAZARD ANALYSIS (JHA)
                </h2>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  OSHA 29 CFR 1926 SAFETY &amp; HEALTH REGULATIONS FOR CONSTRUCTION
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  FORM: SAF-JHA-01
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  DATE: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Context Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">PROJECT:</span>
                <span className="font-bold text-slate-900">{projectName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">TRADE SCOPE:</span>
                <span className="font-bold text-slate-900">{trade}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">COMPETENT PERSON:</span>
                <span className="font-bold text-slate-900">{competentPerson}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase">TASK ACTIVITY:</span>
                <span className="font-bold text-slate-900">{taskDescription}</span>
              </div>
            </div>
          </div>

          {/* Sequenced Hazard Breakdown Table */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1.5 border-l-4 border-slate-900">
              SEQUENCED TASK BREAKDOWN &amp; HIERARCHY OF CONTROLS
            </div>

            <div className="space-y-4">
              {currentSteps.map((step, idx) => (
                <div key={idx} className="border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="text-sm font-bold text-slate-900">
                      Step {idx + 1}: {step.taskStep}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {step.oshaSubpart}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-rose-800">POTENTIAL HAZARDS: </span>
                    {step.hazardDescription}
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block">MANDATORY CONTROL MEASURES:</span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      {step.controlMeasures.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 text-[10px] uppercase">REQUIRED PPE:</span>
                    {step.requiredPpe.map((ppe, pi) => (
                      <span key={pi} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Plan & Contacts */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              EMERGENCY ACTION &amp; MUSTER POINT
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">First Aid Station:</span>
                Gang box #1 (Inspected weekly)
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Emergency Muster:</span>
                North Gate Assembly Flagpole
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Emergency Response:</span>
                Dial 911 immediately
              </div>
            </div>
          </div>

          {/* Sign-Off Block */}
          <div className="pt-6 border-t-2 border-slate-900 space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              CREW REVIEW &amp; COMPETENT PERSON CERTIFICATION
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              I certify that I have inspected the active work zone, identified site-specific hazards, and reviewed the control measures and required PPE with all attending crew members prior to commencing work.
            </p>
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-700 pt-2">
              <div className="space-y-4">
                <div className="border-b border-slate-400 pt-6"></div>
                <div className="text-[10px] text-slate-500 font-medium">Competent Person Signature / Date</div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-slate-400 pt-6"></div>
                <div className="text-[10px] text-slate-500 font-medium">Superintendent / Lead Journeyman Signature / Date</div>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Operational safety documentation template. Does not replace site-specific competent person hazard evaluation.</span>
            <span className="font-bold text-slate-500 shrink-0">AVORRIA CONTRACTOR OPERATING SYSTEM</span>
          </div>
        </div>

        {/* Integration Callout */}
        <div className="p-6 bg-sky-50 border border-sky-200 space-y-3 print:hidden rounded-lg">
          <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider">
            Looking for more safety and compliance resources?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Explore our complete Safety &amp; Compliance library including the Site Safety Audit Checklist, Toolbox Talk Meeting Roster, and Contractor Incident Report.
          </p>
          <div className="pt-1 flex flex-wrap gap-3">
            <Link
              href="/resources/site-safety-inspection"
              className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
            >
              Site Safety Inspection Checklist →
            </Link>
            <Link
              href="/resources"
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
            >
              View All 26 Resources →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
