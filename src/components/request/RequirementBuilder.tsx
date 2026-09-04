'use client';

import React, { useState } from 'react';
import {
  RequirementItem,
  RequirementCategory,
  RequirementStrength,
  RequirementProvenance,
  AddRequirementInput,
} from '@/lib/request/types';

interface RequirementBuilderProps {
  requirements: (RequirementItem | AddRequirementInput)[];
  onAddRequirement: (req: AddRequirementInput) => void;
  onRemoveRequirement: (indexOrId: string | number) => void;
  readOnly?: boolean;
}

const CATEGORIES: { id: RequirementCategory; label: string; icon: string }[] = [
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'licence', label: 'Licence', icon: '📜' },
  { id: 'credential', label: 'Credential', icon: '🎖️' },
  { id: 'safety', label: 'Safety Program', icon: '🦺' },
  { id: 'evidence', label: 'Evidence / Vault', icon: '📁' },
  { id: 'scope', label: 'Scope Specific', icon: '📋' },
  { id: 'site', label: 'Site / Access', icon: '🏗️' },
  { id: 'other', label: 'Other Criteria', icon: '⚙️' },
];

const QUICK_TEMPLATES: AddRequirementInput[] = [
  {
    category: 'insurance',
    title: 'Commercial General Liability ($2M / $4M)',
    description: 'Minimum $2,000,000 each occurrence, $4,000,000 general aggregate with additional insured endorsement.',
    strength: 'required',
    minimum_value: '$2,000,000 per occurrence',
    evidence_required: true,
    provenance: 'template',
  },
  {
    category: 'insurance',
    title: 'Workers Compensation & Employers Liability',
    description: 'Statutory limits in accordance with applicable state laws.',
    strength: 'required',
    minimum_value: 'Statutory Limits',
    evidence_required: true,
    provenance: 'template',
  },
  {
    category: 'licence',
    title: 'State Master Trade Contractor Licence',
    description: 'Valid, unencumbered state license in active good standing.',
    strength: 'required',
    evidence_required: true,
    provenance: 'template',
  },
  {
    category: 'safety',
    title: 'Written Site-Specific Safety Plan (HASP)',
    description: 'Comprehensive written health and safety program compliant with 29 CFR 1926.',
    strength: 'required',
    evidence_required: true,
    provenance: 'template',
  },
  {
    category: 'credential',
    title: 'OSHA 30-Hour Construction Supervisor',
    description: 'At least one full-time on-site supervisor holding valid OSHA 30 card.',
    strength: 'preferred',
    evidence_required: true,
    provenance: 'template',
  },
];

export function RequirementBuilder({
  requirements,
  onAddRequirement,
  onRemoveRequirement,
  readOnly = false,
}: RequirementBuilderProps) {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [category, setCategory] = useState<RequirementCategory>('insurance');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [strength, setStrength] = useState<RequirementStrength>('required');
  const [minimumValue, setMinimumValue] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [evidenceRequired, setEvidenceRequired] = useState(true);

  function handleAdd() {
    if (!title.trim()) return;
    onAddRequirement({
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      strength,
      minimum_value: minimumValue.trim() || undefined,
      jurisdiction: jurisdiction.trim() || undefined,
      evidence_required: evidenceRequired,
      provenance: 'client',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setMinimumValue('');
    setJurisdiction('');
    setIsAddingCustom(false);
  }

  return (
    <div className="space-y-6">
      {/* Existing Requirements Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Structured Requirement Pack</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-200 text-slate-700">
                {requirements.length} item{requirements.length === 1 ? '' : 's'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client-defined compliance and qualification criteria mapped against contractor Passports.
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add Requirement</span>
            </button>
          )}
        </div>

        {requirements.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl mb-3">
              📋
            </div>
            <p className="text-sm font-medium text-slate-700">No requirements defined yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add structured insurance, licensing, safety, or credential criteria to match qualified contractors.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requirements.map((req, idx) => {
              const reqId = 'id' in req ? req.id : idx;
              const strengthColor =
                req.strength === 'required'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : req.strength === 'preferred'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              const catInfo = CATEGORIES.find((c) => c.id === req.category);

              return (
                <div key={reqId} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xl shrink-0 mt-0.5">{catInfo?.icon || '⚙️'}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{req.title}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${strengthColor}`}>
                          {req.strength}
                        </span>
                        {req.evidence_required && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Evidence Required
                          </span>
                        )}
                        {req.provenance && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            src: {req.provenance}
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-xs text-slate-600 mb-1.5 leading-relaxed">{req.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {req.minimum_value && (
                          <span>
                            <strong className="text-slate-700">Threshold:</strong> {req.minimum_value}
                          </span>
                        )}
                        {req.jurisdiction && (
                          <span>
                            <strong className="text-slate-700">Jurisdiction:</strong> {req.jurisdiction}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-700">Category:</strong> {catInfo?.label || req.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onRemoveRequirement(reqId)}
                      className="text-slate-400 hover:text-rose-600 text-xs font-semibold p-1 transition-colors shrink-0"
                      title="Remove requirement"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Institutional Templates */}
      {!readOnly && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Institutional Standard Templates (Click to add)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAddRequirement(tmpl)}
                className="text-left p-3 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {tmpl.title}
                  </span>
                  <span className="text-xs text-brand-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    + Add
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {tmpl.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Requirement Modal / Form */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Define Custom Requirement</h3>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 text-xs transition-all ${
                        category === cat.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Commercial General Liability $2M Occurrence"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Specification</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific policy language, endorsement requirements, or compliance codes..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Strength */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enforcement Strength *</label>
                  <select
                    value={strength}
                    onChange={(e) => setStrength(e.target.value as RequirementStrength)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="required">Mandatory (Required)</option>
                    <option value="preferred">Preferred</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                {/* Minimum Value / Threshold */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coverage / Level</label>
                  <input
                    type="text"
                    value={minimumValue}
                    onChange={(e) => setMinimumValue(e.target.value)}
                    placeholder="e.g. $2,000,000 or Class A"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Jurisdiction */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction (State / County)</label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g. TX or Travis County"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Evidence Required */}
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={evidenceRequired}
                      onChange={(e) => setEvidenceRequired(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Require Document Proof</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!title.trim()}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
              >
                Save Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
