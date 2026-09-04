'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProjectExperience } from '@/lib/create/evidence-types';

interface ProjectsClientProps {
  projects: ProjectExperience[];
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `\$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `\$${Math.round(val / 1_000)}k`;
  return `\$${val.toLocaleString()}`;
}

export function ProjectsClient({ projects: initialProjects }: ProjectsClientProps) {
  const [projects] = useState<ProjectExperience[]>(initialProjects);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'value_desc' | 'date_desc' | 'name_asc'>('value_desc');

  // Summary Metrics
  const completed = projects.filter((p) => p.status === 'completed');
  const totalValue = projects.reduce((acc, p) => acc + (p.contract_value || 0), 0);
  const sectors = Array.from(new Set(projects.map((p) => p.sector)));
  const states = Array.from(new Set(projects.map((p) => p.location_state).filter(Boolean)));
  const withEvidence = projects.filter((p) => (p.evidence_document_ids || []).length > 0);

  // Filtered & Sorted
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (sectorFilter !== 'ALL' && p.sector !== sectorFilter) return false;
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchClient = p.client.toLowerCase().includes(q);
          const matchCity = p.location_city.toLowerCase().includes(q);
          const matchScope = p.scope.toLowerCase().includes(q);
          const matchServices = p.services_delivered.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchClient && !matchCity && !matchScope && !matchServices) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') return b.contract_value - a.contract_value;
        if (sortBy === 'date_desc') return (b.start_date || '').localeCompare(a.start_date || '');
        return a.name.localeCompare(b.name);
      });
  }, [projects, search, sectorFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">PROJECT EXPERIENCE</span>
      </div>

      {/* Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
            COMMERCIAL DELIVERY HISTORY
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
            Project Experience Register
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans font-light">
            Verified institutional project records proving contract capability, sector experience, and technical scope across procurement matching.
          </p>
        </div>

        <Link
          href="/workspace/create/projects/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          + Record New Project
        </Link>
      </div>

      {/* Experience Metrics Bar */}
      <div className="border border-slate-200 bg-white grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs font-mono">
        <div className="p-4 sm:p-5">
          <div className="text-[9px] text-slate-400 font-bold uppercase">COMPLETED PROJECTS</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{completed.length} Projects</div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-[9px] text-slate-400 font-bold uppercase">TOTAL DELIVERED VALUE</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalValue)}</div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-[9px] text-slate-400 font-bold uppercase">EVIDENCE VERIFIED</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {withEvidence.length} / {projects.length} Documented
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-[9px] text-slate-400 font-bold uppercase">SECTORS DEMONSTRATED</div>
          <div className="text-sm font-bold text-slate-800 mt-1 truncate">
            {sectors.length > 0 ? `${sectors.length} Sectors` : 'Insufficient data'}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="text-[9px] text-slate-400 font-bold uppercase">STATES DELIVERED</div>
          <div className="text-sm font-bold text-slate-800 mt-1">
            {states.length > 0 ? states.join(', ') : 'Texas (TX)'}
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="border border-slate-200 bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, client, city, or trade scope..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 focus:border-brand-600 focus:outline-none text-xs font-sans placeholder:text-slate-400"
          />
          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">⌕</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sector Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">SECTOR:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="border border-slate-200 px-2 py-1 bg-white text-slate-700 text-xs focus:outline-none focus:border-brand-600"
            >
              <option value="ALL">All Sectors</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Industrial & Logistics">Industrial & Logistics</option>
              <option value="Municipal & Government">Municipal & Government</option>
              <option value="Education">Education</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 px-2 py-1 bg-white text-slate-700 text-xs focus:outline-none focus:border-brand-600"
            >
              <option value="ALL">All Status</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="bidding">Bidding</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-slate-200 px-2 py-1 bg-white text-slate-700 text-xs focus:outline-none focus:border-brand-600 font-mono"
            >
              <option value="value_desc">Value (High to Low)</option>
              <option value="date_desc">Recent Completion</option>
              <option value="name_asc">Project Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="border border-slate-200 bg-white">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              NO MATCHING PROJECTS FOUND
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans font-light">
              Try adjusting your search terms or filters. Add completed commercial projects to build your evidence base.
            </p>
            <div className="pt-2">
              <Link
                href="/workspace/create/projects/new"
                className="px-4 py-2 bg-brand-600 text-white text-xs font-mono font-bold uppercase tracking-wider inline-block"
              >
                + Record Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">PROJECT & SCOPE</th>
                  <th className="p-4">CLIENT</th>
                  <th className="p-4">LOCATION</th>
                  <th className="p-4">SECTOR</th>
                  <th className="p-4">CONTRACT TYPE</th>
                  <th className="p-4">CONTRACT VALUE</th>
                  <th className="p-4">COMPLETION</th>
                  <th className="p-4">EVIDENCE</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 max-w-xs">
                      <Link
                        href={`/workspace/create/projects/${p.id}`}
                        className="font-bold text-slate-900 hover:text-brand-600 block leading-snug"
                      >
                        {p.name}
                      </Link>
                      <div className="text-[11px] text-slate-500 font-light mt-0.5 line-clamp-1">
                        {p.scope || p.description}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700">
                      <div>{p.client}</div>
                      <div className="text-[10px] text-slate-400">{p.client_type}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                      {p.location_city}, {p.location_state}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                        {p.sector}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {p.contract_type}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(p.contract_value)}
                    </td>
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">
                      {p.status === 'completed' ? (
                        p.completion_date || 'Completed'
                      ) : (
                        <span className="text-brand-600 font-bold uppercase text-[10px]">Active</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[10px] whitespace-nowrap">
                      {p.evidence_document_ids.length > 0 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span>●</span> {p.evidence_document_ids.length} Linked
                        </span>
                      ) : (
                        <span className="text-slate-400">Self-Declared</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono whitespace-nowrap">
                      <Link
                        href={`/workspace/create/projects/${p.id}`}
                        className="text-brand-600 hover:underline font-bold text-xs"
                      >
                        Inspect →
                      </Link>
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
