'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceDocument } from '@/lib/workspace/types';
import { ClientSector, ProjectType, ContractType } from '@/lib/create/evidence-types';

interface NewProjectFormProps {
  documents: WorkspaceDocument[];
  defaultCity?: string;
  defaultState?: string;
}

export function NewProjectForm({
  documents,
  defaultCity = 'Austin',
  defaultState = 'TX',
}: NewProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [clientType, setClientType] = useState('Commercial');
  const [locationCity, setLocationCity] = useState(defaultCity);
  const [locationState, setLocationState] = useState(defaultState);
  const [sector, setSector] = useState<ClientSector>('Commercial Office');
  const [projectType, setProjectType] = useState<ProjectType>('Renovation / Retrofit');
  const [contractType, setContractType] = useState<ContractType>('Lump Sum');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [status, setStatus] = useState<'completed' | 'active' | 'bidding'>('completed');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [challenges, setChallenges] = useState('');
  const [deliveryMethodology, setDeliveryMethodology] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!client.trim()) {
      setError('Client name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const servicesDelivered = servicesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name,
        client,
        client_type: clientType,
        location_city: locationCity,
        location_state: locationState,
        sector,
        project_type: projectType,
        contract_type: contractType,
        start_date: startDate || new Date().toISOString().slice(0, 7),
        completion_date: status === 'completed' ? completionDate : undefined,
        contract_value: parseFloat(contractValue.replace(/[^0-9.]/g, '')) || 0,
        status,
        description,
        scope,
        services_delivered: servicesDelivered,
        challenges,
        delivery_methodology: deliveryMethodology,
        outcomes,
        evidence_document_ids: selectedDocIds,
      };

      const res = await fetch('/api/workspace/create/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save project');
      }

      router.push(`/workspace/create/projects/${data.project.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record project');
      setIsSubmitting(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/workspace/create" className="hover:text-brand-600">
          CREATE
        </Link>
        <span>/</span>
        <Link href="/workspace/create/projects" className="hover:text-brand-600">
          PROJECTS
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">RECORD PROJECT</span>
      </div>

      {/* Header */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8">
        <div className="text-[10px] font-mono uppercase text-brand-600 font-bold tracking-[0.18em]">
          COMMERCIAL EVIDENCE RECORDING
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
          Record Commercial Project Experience
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-sans font-light leading-relaxed">
          Record verified past project performance. This information becomes reusable evidence deployed in Win Work opportunity matching, RFQ responses, and your Contractor Passport.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* 1. PROJECT IDENTITY & CLIENT */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            PART 01
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Project Identity & Client Organization
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Austin Regional Medical Center — 480V Substation Upgrade"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Client / General Contractor Organization *
            </label>
            <input
              type="text"
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Travis County Healthcare District"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Client Type
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none"
            >
              <option value="Commercial">Commercial</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Industrial">Industrial</option>
              <option value="Municipal / Government">Municipal / Government</option>
              <option value="Education">Education</option>
              <option value="General Contractor">General Contractor (Subcontract)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              City
            </label>
            <input
              type="text"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="Austin"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              State
            </label>
            <input
              type="text"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value.toUpperCase())}
              placeholder="TX"
              maxLength={2}
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* 2. COMMERCIAL TERMS & TIMELINE */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            PART 02
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Commercial Terms & Schedule
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Sector Classification
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as ClientSector)}
              className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none"
            >
              <option value="Healthcare">Healthcare</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Industrial & Logistics">Industrial & Logistics</option>
              <option value="Municipal & Government">Municipal & Government</option>
              <option value="Education">Education</option>
              <option value="Critical Power / Data Center">Critical Power / Data Center</option>
              <option value="Retail & Hospitality">Retail & Hospitality</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none"
            >
              <option value="Renovation / Retrofit">Renovation / Retrofit</option>
              <option value="New Construction">New Construction</option>
              <option value="Emergency Replacement">Emergency Replacement</option>
              <option value="Maintenance & Service">Maintenance & Service</option>
              <option value="Tenant Improvement">Tenant Improvement</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Contract Type
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              className="w-full px-3 py-2 border border-slate-300 bg-white focus:border-brand-600 focus:outline-none font-mono"
            >
              <option value="Lump Sum">Lump Sum</option>
              <option value="Guaranteed Maximum Price (GMP)">Guaranteed Maximum Price (GMP)</option>
              <option value="Cost Plus">Cost Plus</option>
              <option value="Time & Materials">Time & Materials</option>
              <option value="Unit Price">Unit Price</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Total Contract Value (USD) *
            </label>
            <input
              type="text"
              required
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="1,450,000"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Start Date (YYYY-MM)
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Completion Date (YYYY-MM)
            </label>
            <input
              type="month"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              disabled={status !== 'completed'}
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono disabled:bg-slate-100"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Project Execution Status
            </label>
            <div className="flex gap-4 font-mono text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                />
                <span>Completed</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                <span>Active / Underway</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="bidding"
                  checked={status === 'bidding'}
                  onChange={() => setStatus('bidding')}
                />
                <span>Bidding / Award Pending</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCOPE, METHODOLOGY & OUTCOMES */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            PART 03
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Scope, Methodology & Outcomes
          </h2>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Executive Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level project summary highlighting critical facility context and operational achievements..."
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Technical Scope & Equipment Installed
            </label>
            <textarea
              rows={3}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Specific technical scopes, amp capacities, feeder sizes, switchgear specifications, and systems furnished..."
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
              Services Delivered (comma-separated tags)
            </label>
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="480V Switchgear, Arc Flash Coordination, Generator Transfer, VFD Integration"
              className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Challenges & Delivery Methodology
              </label>
              <textarea
                rows={3}
                value={deliveryMethodology}
                onChange={(e) => setDeliveryMethodology(e.target.value)}
                placeholder="How your team solved complex site constraints, live occupancy, zero-outage cutovers, or tight schedules..."
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                Project Outcomes & Performance Metrics
              </label>
              <textarea
                rows={3}
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                placeholder="Measurable results: zero outages, delivered 2 weeks early, utility rebates secured, zero recordables..."
                className="w-full px-3 py-2 border border-slate-300 focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SUPPORTING DOCUMENT EVIDENCE */}
      <div className="border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            PART 04
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
            Link Supporting Documentary Evidence
          </h2>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            Attach existing workspace completion certificates, sign-offs, or test reports without duplicating uploaded files.
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500">
            No existing documents in your archive. You can link completion certificates later from the project detail page.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 max-h-56 overflow-y-auto">
            {documents.map((doc) => (
              <label
                key={doc.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedDocIds.includes(doc.id)}
                    onChange={() => toggleDocSelection(doc.id)}
                  />
                  <div>
                    <div className="font-bold text-slate-900 font-sans">{doc.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">{doc.type} · Version {doc.version}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(doc.updated_at).toLocaleDateString()}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/workspace/create/projects"
          className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Recording...' : 'Record Project Experience →'}
        </button>
      </div>
    </form>
  );
}
