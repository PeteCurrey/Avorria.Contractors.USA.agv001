'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CommercialReference, ProjectExperience } from '@/lib/create/evidence-types';

interface ReferencesClientProps {
  references: CommercialReference[];
  projects: ProjectExperience[];
}

export function ReferencesClient({
  references: initialReferences,
  projects,
}: ReferencesClientProps) {
  const [references, setReferences] = useState<CommercialReference[]>(initialReferences);
  const [isAdding, setIsAdding] = useState(false);
  const [clientOrg, setClientOrg] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [referenceType, setReferenceType] = useState<'client' | 'general_contractor' | 'architect_engineer'>('client');
  const [testimonial, setTestimonial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const p = projects.find((item) => item.id === selectedProjectId);
      const payload = {
        client_organization: clientOrg,
        contact_name: contactName,
        contact_title: contactTitle,
        contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        project_id: selectedProjectId || undefined,
        project_name: p ? p.name : 'Commercial Contract',
        reference_type: referenceType,
        date_provided: new Date().toISOString().slice(0, 10),
        status: 'verified',
        testimonial,
        rating: 5,
        is_private: true,
      };

      const res = await fetch('/api/workspace/create/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record reference');

      setReferences([data.reference, ...references]);
      setIsAdding(false);
      setClientOrg('');
      setContactName('');
      setContactTitle('');
      setContactEmail('');
      setContactPhone('');
      setTestimonial('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding reference');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">REFERENCES</span>
      </div>

      {/* Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
            THIRD-PARTY QUALIFICATION EVIDENCE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
            Commercial References Register
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans font-light">
            Verified institutional references from facility owners, general contractors, and engineering consultants supporting procurement qualification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
        >
          {isAdding ? '✕ Cancel' : '+ Add Reference'}
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="border border-slate-200 bg-slate-50 p-4 flex items-start gap-3 text-xs text-slate-600 font-sans leading-relaxed">
        <div className="text-brand-600 font-mono font-bold text-sm">🔒</div>
        <div>
          <span className="font-bold text-slate-800 font-mono text-[11px] uppercase block">
            DATA PRIVACY & PROCUREMENT INTEGRITY:
          </span>
          Commercial reference contact details (direct phone numbers and emails) are confidential enterprise records. They are encrypted and used solely for authorized buyer due-diligence and never indexed publicly.
        </div>
      </div>

      {/* Add Reference Form */}
      {isAdding && (
        <form onSubmit={handleAddReference} className="border border-brand-200 bg-white p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="text-[10px] font-mono uppercase text-brand-600 font-bold">
              NEW PROCUREMENT REFERENCE
            </div>
            <h2 className="text-base font-bold text-slate-900 font-sans mt-0.5">
              Record Client / General Contractor Reference
            </h2>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={clientOrg}
                onChange={(e) => setClientOrg(e.target.value)}
                placeholder="e.g. Travis County Healthcare District"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Reference Entity Type
              </label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none font-mono"
              >
                <option value="client">Owner / Facility Client</option>
                <option value="general_contractor">General Contractor (Prime Partner)</option>
                <option value="architect_engineer">Architect / Consulting Engineer</option>
                <option value="procurement">Procurement Officer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Robert Henderson, PE"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Contact Title / Position
              </label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="Director of Facilities & Engineering"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Contact Email (Confidential)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="r.henderson@traviscountyhealth.org"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Contact Phone (Confidential)
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(512) 555-8902"
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Associated Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none"
              >
                <option value="">-- Standalone / Master Service Agreement --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Reference Testimonial / Performance Statement *
              </label>
              <textarea
                rows={3}
                required
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Quote or feedback describing safety conduct, schedule adherence, change order fairness, and quality of installation..."
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 text-white text-xs font-mono font-bold uppercase disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Reference'}
            </button>
          </div>
        </form>
      )}

      {/* References List */}
      <div className="space-y-4">
        {references.map((ref) => (
          <div key={ref.id} className="border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 font-sans">
                    {ref.client_organization}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">•</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {ref.reference_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-600 mt-0.5">
                  Contact: <span className="font-bold">{ref.contact_name}</span> ({ref.contact_title})
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 uppercase text-[10px]">
                  {ref.status}
                </span>
                <span className="text-slate-400 text-[11px]">{ref.date_provided}</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="pl-4 border-l-2 border-brand-600 py-1">
              <p className="text-xs text-slate-700 italic font-sans font-light leading-relaxed">
                "{ref.testimonial}"
              </p>
            </div>

            {/* Project connection & Confidentiality */}
            <div className="pt-2 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span>Subject Project:</span>
                <span className="text-slate-800 font-bold">{ref.project_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span>🔒 Confidential Verification Record</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
