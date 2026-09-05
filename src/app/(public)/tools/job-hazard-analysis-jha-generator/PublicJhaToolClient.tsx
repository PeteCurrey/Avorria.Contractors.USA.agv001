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

const DEFAULT_TRADE_STEPS: Record<string, HazardStep[]> = {
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
  'General Construction': [
    {
      taskStep: 'Excavation & Trench Shoring Installation',
      hazardDescription: 'Cave-in, toxic atmospheric conditions, underground utility strike.',
      controlMeasures: [
        'Deploy certified trench box or benching per OSHA 1926 Subpart P.',
        'Perform multi-gas detector atmosphere test prior to entry.',
        'Verify 811 utility ticket clearance before digging.',
      ],
      requiredPpe: ['Hard Hat Class E', 'Hi-Vis Vest Class 3', 'Metatarsal Steel Boots'],
      oshaSubpart: 'OSHA 29 CFR 1926 Subpart P (Excavations)',
    },
  ],
};

export function PublicJhaToolClient() {
  const [trade, setTrade] = useState('Electrical Contracting');
  const [projectName, setProjectName] = useState('Centennial Plaza Commercial Complex');
  const [competentPerson, setCompetentPerson] = useState('Marcus Vance, Lead Safety Supervisor');
  const [taskDescription, setTaskDescription] = useState('Switchgear replacement and heavy feeder wire pull');
  const [siteAddress, setSiteAddress] = useState('100 Main St, Austin TX');

  // Generated document state
  const [currentSteps, setCurrentSteps] = useState<HazardStep[]>(
    DEFAULT_TRADE_STEPS['Electrical Contracting']
  );
  const [emergencyProcedures, setEmergencyProcedures] = useState(
    'Call 911 immediately in event of serious injury or arc flash incident. Nearest hospital: Dell Seton Medical Center. Muster point: Main Gate.'
  );
  const [latestPdfBase64, setLatestPdfBase64] = useState<string | null>(null);

  // Status & Rate Limit State
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Trade switch preset updates
  const handleTradeChange = (newTrade: string) => {
    setTrade(newTrade);
    if (DEFAULT_TRADE_STEPS[newTrade]) {
      setCurrentSteps(DEFAULT_TRADE_STEPS[newTrade]);
    }
  };

  // Generate via real AI Document Engine
  const handleGenerateJha = async () => {
    setIsGenerating(true);
    setRateLimitError(null);
    setDownloadSuccess(false);

    try {
      const payload = {
        isPublic: true,
        userInput: {
          project_name: projectName,
          trade,
          competent_person: competentPerson,
          site_address: siteAddress,
          tasks: [{ task_description: taskDescription }],
        },
      };

      const res = await fetch('/api/generate/jha', {
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate JHA document');
      }

      if (data.rateLimit?.remaining !== undefined) {
        setRemainingGenerations(data.rateLimit.remaining);
      }

      // Populate interactive table from real generated structured content
      const content = data.document?.content;
      if (content?.tasks && Array.isArray(content.tasks)) {
        const mappedSteps: HazardStep[] = content.tasks.map((t: any) => ({
          taskStep: t.task_description,
          hazardDescription: (t.hazards || []).map((h: any) => h.hazard_type || h.description).join('; ') || 'General physical hazard',
          controlMeasures: (t.controls || []).map((c: any) => c.description),
          requiredPpe: t.required_ppe || ['Hard Hat', 'Safety Glasses', 'Steel-toe boots'],
          oshaSubpart: t.controls?.[0]?.osha_subpart_reference || 'OSHA 1926 Aligned',
        }));
        setCurrentSteps(mappedSteps);
        if (content.emergency_procedures) {
          setEmergencyProcedures(content.emergency_procedures);
        }
      }

      if (data.pdfBase64) {
        setLatestPdfBase64(data.pdfBase64);
        downloadPdfBytes(data.pdfBase64, `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_jha.pdf`);
        setDownloadSuccess(true);
      }

      // Store in localStorage for seamless onboarding transfer
      try {
        localStorage.setItem(
          'avorria_pending_document',
          JSON.stringify({
            type: 'jha',
            title: `${projectName} - Job Hazard Analysis`,
            userInput: payload.userInput,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Fallback
      }
    } catch (err: any) {
      setRateLimitError(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to trigger direct browser file download
  const downloadPdfBytes = (base64: string, filename: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExistingPdf = () => {
    if (latestPdfBase64) {
      downloadPdfBytes(latestPdfBase64, `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_jha.pdf`);
    } else {
      handleGenerateJha();
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEEF] text-[#111827] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
            <Link href="/tools" className="hover:text-[#F97316] transition-colors">
              TOOLS
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-semibold">JOB HAZARD ANALYSIS (JHA)</span>
            <span>/</span>
            <span className="px-2 py-0.5 bg-orange-100 text-[#F97316] font-bold rounded text-[10px]">
              OSHA 1926 COMPLIANT
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#111827]">
                Job Hazard Analysis (JHA) Generator
              </h1>
              <p className="text-sm text-[#64748B] mt-1 max-w-2xl font-light">
                Generate an OSHA 1926-aligned Job Hazard Analysis for pre-task planning. Break down scheduled work
                activities, identify physical hazards, enforce the hierarchy of controls, and generate clean jobsite
                documentation.
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
              href="/sign-up?intent=jha_limit"
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
                JHA PDF Generated &amp; Downloaded
              </div>
              <p className="text-sm">
                Save this, brand it with your logo, and generate unlimited JHAs. Create your free account in 30 seconds.
              </p>
            </div>
            <Link
              href="/sign-up?intent=save_document"
              className="whitespace-nowrap px-4 py-2 bg-[#111827] hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors"
            >
              Save &amp; Brand Fully (Free) →
            </Link>
          </div>
        )}

        {/* Configuration Card */}
        <div className="bg-white border border-[#E2E4E8] shadow-xs p-6 space-y-4 print:hidden rounded-lg">
          <div className="flex items-center justify-between border-b border-[#ECEEEF] pb-2">
            <h2 className="text-xs font-bold text-[#64748B] uppercase font-mono tracking-wider">
              Task Configuration &amp; Project Context
            </h2>
            <span className="text-[11px] font-mono text-[#64748B]">OSHA Subpart C / K / M / P</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[#64748B] mb-1 font-mono uppercase text-[11px]">Primary Trade Scope</label>
              <select
                value={trade}
                onChange={(e) => handleTradeChange(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E2E4E8] focus:border-[#F97316] px-3 py-2 text-[#111827] outline-none rounded"
              >
                <option value="Electrical Contracting">Electrical Contracting</option>
                <option value="HVAC & Mechanical">HVAC &amp; Mechanical</option>
                <option value="Concrete & Masonry">Concrete &amp; Masonry</option>
                <option value="General Construction">General Construction</option>
              </select>
            </div>

            <div>
              <label className="block text-[#64748B] mb-1 font-mono uppercase text-[11px]">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E2E4E8] focus:border-[#F97316] px-3 py-2 text-[#111827] outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-[#64748B] mb-1 font-mono uppercase text-[11px]">Competent Person</label>
              <input
                type="text"
                value={competentPerson}
                onChange={(e) => setCompetentPerson(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E2E4E8] focus:border-[#F97316] px-3 py-2 text-[#111827] outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-[#64748B] mb-1 font-mono uppercase text-[11px]">Jobsite Location</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E2E4E8] focus:border-[#F97316] px-3 py-2 text-[#111827] outline-none rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#64748B] mb-1 font-mono uppercase text-[11px]">
              Specific Task Description / Scope
            </label>
            <input
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E2E4E8] focus:border-[#F97316] px-3 py-2 text-sm text-[#111827] outline-none rounded"
            />
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#ECEEEF]">
            <span className="text-xs font-mono text-[#64748B]">
              Deterministic OSHA checks &bull; Complete vector Avorria branding
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateJha}
                className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium uppercase tracking-wider transition-colors rounded shadow-xs flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Branded JHA...</span>
                  </>
                ) : (
                  <span>Generate OSHA-Aligned JHA &amp; Download PDF</span>
                )}
              </button>

              {latestPdfBase64 && (
                <button
                  type="button"
                  onClick={handleDownloadExistingPdf}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#E2E4E8] text-[#111827] text-xs font-mono uppercase rounded transition-colors"
                >
                  Download PDF Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Document Preview Card */}
        <div className="bg-white border border-[#E2E4E8] shadow-sm rounded-lg overflow-hidden">
          {/* Document Header Bar */}
          <div className="bg-[#111827] text-white p-6 border-b-2 border-[#F97316] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F97316] font-bold">
                OSHA 29 CFR 1926 COMPLIANCE
              </div>
              <h2 className="text-xl font-light tracking-tight mt-1">
                JOB HAZARD ANALYSIS (JHA) REPORT
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {projectName} &bull; {trade} &bull; Supervisor: {competentPerson}
              </div>
            </div>

            <span className="px-2.5 py-1 bg-white/10 text-xs font-mono rounded text-slate-300">
              OFFICIAL EPHEMERAL PREVIEW
            </span>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E4E8] bg-[#FAFAFA] text-[#64748B] font-mono uppercase text-[10px]">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-1/4">Sequence of Basic Job Steps</th>
                  <th className="py-3 px-3 w-1/4">Potential Hazards</th>
                  <th className="py-3 px-3 w-1/3">Recommended Action or Control Procedure</th>
                  <th className="py-3 px-3">Required PPE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEEF]">
                {currentSteps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-3 font-mono text-center text-[#64748B] font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#111827]">
                      {step.taskStep}
                      <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                        {step.oshaSubpart}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#64748B] leading-relaxed">
                      {step.hazardDescription}
                    </td>
                    <td className="py-3.5 px-3 space-y-1">
                      {step.controlMeasures.map((ctrl, cidx) => (
                        <div key={cidx} className="flex items-start gap-1.5 text-[#111827]">
                          <span className="text-[#F97316] font-bold">&bull;</span>
                          <span>{ctrl}</span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {step.requiredPpe.map((ppe, pidx) => (
                          <span
                            key={pidx}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono"
                          >
                            {ppe}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Emergency Procedures Callout */}
          <div className="p-6 bg-[#FAFAFA] border-t border-[#ECEEEF] space-y-1 text-xs">
            <div className="font-mono font-bold uppercase text-[10px] text-[#64748B]">
              Emergency Procedures &amp; Response Protocol
            </div>
            <p className="text-[#111827] leading-relaxed">{emergencyProcedures}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
