'use client';

import React from 'react';
import Link from 'next/link';
import { ProjectExperience } from '@/lib/create/evidence-types';
import { WorkspaceDocument } from '@/lib/workspace/types';

interface ProjectDetailClientProps {
  project: ProjectExperience;
  linkedDocuments: WorkspaceDocument[];
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `\$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `\$${Math.round(val / 1_000)}k`;
  return `\$${val.toLocaleString()}`;
}

export function ProjectDetailClient({ project, linkedDocuments }: ProjectDetailClientProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <Link href="/workspace/create/projects" className="hover:text-brand-600">
          PROJECTS
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate">{project.name.slice(0, 35)}...</span>
      </div>

      {/* Top Header Card */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 font-bold">
                {project.sector}
              </span>
              <span className="text-[10px] font-mono text-slate-400">•</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{project.project_type}</span>
              <span className="text-[10px] font-mono text-slate-400">•</span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 ${
                  project.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-brand-50 text-brand-700 border border-brand-200'
                }`}
              >
                {project.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans mt-2">
              {project.name}
            </h1>
            <div className="text-xs font-mono text-slate-500">
              Client: <span className="text-slate-800 font-bold">{project.client}</span> ({project.client_type}) · {project.location_city}, {project.location_state}
            </div>
          </div>

          <div className="text-right shrink-0 font-mono space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold">CONTRACT SUM</div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(project.contract_value)}</div>
            <div className="text-[11px] text-slate-500">{project.contract_type}</div>
          </div>
        </div>

        {/* Win Work Platform Intelligence Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 inline-block" />
            <span className="text-slate-800 font-bold">COMMERCIAL REUSE:</span>
            <span className="text-slate-600">
              Active in Avorria's commercial memory. Available as proof in Win Work & Passport.
            </span>
          </div>
          <Link
            href="/workspace/win-work"
            className="text-brand-600 hover:underline font-bold text-[11px] shrink-0"
          >
            Check Win Work Opportunities →
          </Link>
        </div>
      </div>

      {/* Main Grid: Narrative & Commercial Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Scope, Methodology, Outcomes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Overview & Scope */}
          <div className="border border-slate-200 bg-white p-6 space-y-4">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              PROJECT OVERVIEW & SPECIFICATION
            </div>

            <div className="text-xs text-slate-700 font-sans leading-relaxed font-light">
              {project.description}
            </div>

            {project.scope && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">TECHNICAL SCOPE OF WORK</div>
                <p className="text-xs text-slate-600 font-sans font-light leading-relaxed whitespace-pre-line">
                  {project.scope}
                </p>
              </div>
            )}
          </div>

          {/* Delivery Methodology & Challenges */}
          {(project.delivery_methodology || project.challenges) && (
            <div className="border border-slate-200 bg-white p-6 space-y-4">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                EXECUTION STRATEGY & PROBLEM SOLVING
              </div>

              {project.challenges && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-red-700 font-bold">SITE CONSTRAINTS & CHALLENGES</div>
                  <p className="text-xs text-slate-600 font-sans font-light leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              )}

              {project.delivery_methodology && (
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-brand-700 font-bold">DELIVERY METHODOLOGY</div>
                  <p className="text-xs text-slate-600 font-sans font-light leading-relaxed">
                    {project.delivery_methodology}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Outcomes */}
          {project.outcomes && (
            <div className="border border-slate-200 bg-white p-6 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                MEASURABLE OUTCOMES
              </div>
              <div className="p-3 bg-emerald-50/40 border border-emerald-200 text-xs text-emerald-900 font-sans leading-relaxed font-light">
                {project.outcomes}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 cols: Metadata, Evidence & Case Study Action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Key Dates & Profile */}
          <div className="border border-slate-200 bg-white p-5 space-y-3 text-xs font-mono">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              COMMERCIAL ATTRIBUTES
            </div>

            <div className="divide-y divide-slate-100 text-[11px]">
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">COMMENCEMENT:</span>
                <span className="text-slate-800 font-bold">{project.start_date || 'N/A'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">COMPLETION:</span>
                <span className="text-slate-800 font-bold">{project.completion_date || 'In Progress'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">CONTRACT TYPE:</span>
                <span className="text-slate-800">{project.contract_type}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">JURISDICTION:</span>
                <span className="text-slate-800">{project.location_city}, {project.location_state}</span>
              </div>
            </div>
          </div>

          {/* Services Delivered Chips */}
          {project.services_delivered.length > 0 && (
            <div className="border border-slate-200 bg-white p-5 space-y-3">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                SERVICES & CAPABILITIES
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.services_delivered.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-[10px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Documents / Evidence */}
          <div className="border border-slate-200 bg-white p-5 space-y-3">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              LINKED EVIDENCE RECORDS
            </div>

            {linkedDocuments.length === 0 ? (
              <div className="text-[11px] font-mono text-slate-400">
                {project.evidence_summary || 'No documents attached. You can link completion certificates from the Documents repository.'}
              </div>
            ) : (
              <div className="space-y-2">
                {linkedDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/workspace/documents/${doc.id}`}
                    className="p-2.5 bg-slate-50 border border-slate-200 hover:border-brand-500 block text-xs transition-colors"
                  >
                    <div className="font-bold text-slate-800 truncate">{doc.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      {doc.type} · View Document →
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Case Study Generation CTA */}
          <div className="border border-brand-200 bg-blue-50/20 p-5 space-y-2">
            <div className="text-[10px] font-mono text-brand-600 font-bold uppercase">
              REUSABLE CASE STUDY
            </div>
            <p className="text-xs text-slate-600 font-sans font-light leading-snug">
              Transform this completed contract into an editorial case study for inclusion in prequalification and proposal packages.
            </p>
            <div className="pt-2">
              <Link
                href={`/workspace/create/case-studies`}
                className="w-full text-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider block transition-colors"
              >
                View Case Studies Register →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
