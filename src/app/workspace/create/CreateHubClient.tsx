'use client';

import React from 'react';
import Link from 'next/link';
import { Organization, WorkspaceUser, WorkspaceDocument } from '@/lib/workspace/types';
import { CreateDocumentType } from '@/lib/create/types';

interface CreateHubClientProps {
  organization: Organization;
  user: WorkspaceUser;
  documents: WorkspaceDocument[];
}

interface GeneratorCardDef {
  type: CreateDocumentType;
  title: string;
  category: 'Safety & OSHA' | 'Commercial & Estimating' | 'Contract Governance';
  standard: string;
  duration: string;
  description: string;
  href: string;
  iconPath: string;
}

const GENERATOR_CARDS: GeneratorCardDef[] = [
  {
    type: 'jha',
    title: 'Job Hazard Analysis (JHA)',
    category: 'Safety & OSHA',
    standard: 'OSHA 1926 Subparts C, E, K, M, P',
    duration: '3-4 mins',
    description: 'Task-by-task hazard identification, Hierarchy of Controls, PPE requirements, and emergency protocols.',
    href: '/workspace/create/jha',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    type: 'jsa',
    title: 'Job Safety Analysis (JSA)',
    category: 'Safety & OSHA',
    standard: 'Daily Field Briefing Standard',
    duration: '2-3 mins',
    description: 'Single-task crew safety briefing document for morning tailgates and high-hazard operation sign-offs.',
    href: '/workspace/create/jsa',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    type: 'safety_plan',
    title: 'Construction Safety Plan',
    category: 'Safety & OSHA',
    standard: 'Site-Specific HASP Standard',
    duration: '5-7 mins',
    description: 'Company- and project-level health and safety plan with competent persons, section policies, and emergency plan.',
    href: '/workspace/create/safety-plan',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    type: 'toolbox_talk',
    title: 'Toolbox Talk & Attendance',
    category: 'Safety & OSHA',
    standard: 'Weekly Crew Safety Log',
    duration: '2 mins',
    description: '5-10 minute trade-tailored safety discussion with built-in digital crew attendance and signature capture.',
    href: '/workspace/create/toolbox-talk',
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    type: 'quote',
    title: 'Quote & Proposal Generator',
    category: 'Commercial & Estimating',
    standard: 'Deterministic Server Math',
    duration: '3-5 mins',
    description: 'Direct cost, labor burden, and margin calculation with AI scope of work narrative and client milestones.',
    href: '/workspace/create/quote',
    iconPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    type: 'change_order',
    title: 'Change Order Generator',
    category: 'Contract Governance',
    standard: 'Contract Delta Accounting',
    duration: '3 mins',
    description: 'Formal contract adjustment document with schedule extension, cost justification, and revised contract sums.',
    href: '/workspace/create/change-order',
    iconPath: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
  },
];

export function CreateHubClient({ organization, user, documents }: CreateHubClientProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#090d16] border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-sky-500 inline-block" />
            <span className="font-mono text-xs font-bold text-sky-400 tracking-wider uppercase">
              CREATE PILLAR • AI DOCUMENT ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Document Generation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Generate OSHA-aligned safety documentation, deterministic quotes, and contractual change orders.
            All documents render into branded PDFs with digital signature execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/documents"
            className="px-4 py-2 bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors uppercase tracking-wider"
          >
            Open Vault ({documents.length})
          </Link>
        </div>
      </div>

      {/* Generator Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-mono text-xs font-bold text-slate-400 tracking-wider uppercase">
            AVAILABLE DOCUMENT ENGINES (6)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            STRUCTURED INPUT • ZERO ARITHMETIC DRIFT • DIGITAL SIGNATURES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GENERATOR_CARDS.map((card) => (
            <div
              key={card.type}
              className="bg-[#090d16] border border-slate-800 hover:border-sky-500/60 transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-900 border border-slate-800 text-sky-400 font-bold">
                    {card.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {card.duration}
                  </span>
                </div>

                <div>
                  <h3 className="font-sans text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {card.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {card.standard}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80">
                <Link
                  href={card.href}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-colors"
                >
                  <span>Launch Generator</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Generated Documents Table */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="font-mono text-xs font-bold text-slate-400 tracking-wider uppercase">
            RECENT AI DOCUMENTS ({documents.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            AUTO-SAVED TO ORGANIZATION VAULT
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="bg-[#090d16] border border-slate-800 p-8 text-center space-y-3">
            <div className="w-10 h-10 bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="font-mono text-sm text-slate-300 font-bold">
              No AI documents generated yet
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select any generator above to build an OSHA-compliant safety document or commercial proposal in under 3 minutes.
            </p>
          </div>
        ) : (
          <div className="bg-[#090d16] border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Generated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {documents.slice(0, 10).map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      <Link href={`/workspace/documents/${doc.id}`} className="hover:text-sky-400 transition-colors">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400 uppercase text-[11px]">
                      {doc.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-sky-400 font-bold">
                      v{doc.version}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {doc.is_signed ? (
                        <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase">
                          Signed & Locked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-bold uppercase">
                          Draft / Unsigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/workspace/documents/${doc.id}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] uppercase font-bold tracking-wider"
                      >
                        View
                      </Link>
                      <a
                        href={`/api/documents/${doc.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-[10px] uppercase font-bold tracking-wider"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
