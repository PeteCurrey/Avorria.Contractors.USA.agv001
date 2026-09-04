'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function PublicJhaToolClient() {
  const [trade, setTrade] = useState('Electrical Contracting');
  const [taskName, setTaskName] = useState('Main Switchgear De-energization and Tie-in');
  const [hazardType, setHazardType] = useState('Electrical Arc Flash / Shock');
  const [isGenerated, setIsGenerated] = useState(false);

  const sampleResult = {
    project: 'Sample Field Demonstration Project',
    task: taskName,
    hazard: hazardType,
    subpart: 'OSHA 1926 Subpart K (Electrical)',
    controls: [
      'De-energize upstream feeder breaker and apply Master Lock LOTO hasp.',
      'Perform live-dead-live testing using calibrated Fluke multimeter.',
      'Establish 10ft perimeter boundary with red danger tape and high-voltage warnings.',
    ],
    ppe: ['NFPA 70E Category 2 Arc Flash Shield', 'Class 0 Dielectric Gloves (1000V rated)', 'EH Safety Boots'],
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-sky-400 font-mono text-xs font-bold uppercase tracking-wider">
            FREE PUBLIC GENERATOR • WATERMARKED PREVIEW
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Online Job Hazard Analysis (JHA) Generator
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Test-drive the OSHA 1926-aligned JHA engine. Generate single-use preview summaries or sign up to save, brand, and execute unlimited documents.
          </p>
        </div>

        {/* Interactive Form Card */}
        <div className="bg-[#090d16] border border-slate-800 p-6 space-y-4 font-mono text-xs">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            TASK CONFIGURATION (SINGLE-USE PREVIEW)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">PRIMARY TRADE</label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="Electrical Contracting">Electrical Contracting</option>
                <option value="HVAC & Mechanical">HVAC & Mechanical</option>
                <option value="Roofing & Waterproofing">Roofing & Waterproofing</option>
                <option value="Plumbing & Pipefitting">Plumbing & Pipefitting</option>
                <option value="Concrete & Masonry">Concrete & Masonry</option>
                <option value="Steel Erection & Rigging">Steel Erection & Rigging</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ANTICIPATED HAZARD</label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
              >
                <option value="Electrical Arc Flash / Shock">Electrical Arc Flash / Shock</option>
                <option value="Fall from Height > 6ft">Fall from Height &gt; 6ft</option>
                <option value="Struck-By Falling Objects">Struck-By Falling Objects</option>
                <option value="Caught-In / Between Machinery">Caught-In / Between Machinery</option>
                <option value="Silica Dust Exposure">Silica Dust Exposure</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">TASK STEP DESCRIPTION</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-[#030712] border border-slate-800 px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsGenerated(true)}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold uppercase tracking-wider"
            >
              Generate Free JHA Preview →
            </button>
          </div>
        </div>

        {/* Output Preview with Watermark & Upsell CTA */}
        {isGenerated && (
          <div className="space-y-6">
            {/* Watermark Banner */}
            <div className="relative bg-[#090d16] border border-amber-800/80 p-6 space-y-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-6xl font-mono font-black text-red-500 rotate-[-20deg] select-none">
                  WATERMARKED PREVIEW • NOT SAVED
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
                <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 font-bold uppercase">
                  Single-Use Preview
                </span>
                <span className="text-slate-500">Watermarked • Unsaved</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="text-sm font-bold text-white font-sans">
                  {sampleResult.task}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">STANDARD:</span> {sampleResult.subpart}
                </div>

                <div className="pt-2">
                  <div className="text-sky-400 font-bold uppercase mb-1">MANDATORY CONTROLS:</div>
                  <ul className="space-y-1 list-disc pl-4 text-slate-300">
                    {sampleResult.controls.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <div className="text-sky-400 font-bold uppercase mb-1">REQUIRED PPE:</div>
                  <div className="flex flex-wrap gap-2">
                    {sampleResult.ppe.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MANDATORY UPSELL CTA */}
            <div className="bg-[#0b1324] border-2 border-sky-500 p-8 text-center space-y-4">
              <div className="w-10 h-10 bg-sky-950 border border-sky-700 text-sky-400 mx-auto flex items-center justify-center font-bold">
                ★
              </div>
              <h3 className="text-xl font-bold text-white">
                Save this, brand it, and generate unlimited documents — start free
              </h3>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Avorria workspace accounts include your company logo, custom branding, digital signature execution, OSHA audit trails, and automatic Readiness Score boosting.
              </p>
              <div className="pt-2">
                <Link
                  href="/sign-up?intent=tool_jha"
                  className="inline-block px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  Create Free Workspace Account →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
