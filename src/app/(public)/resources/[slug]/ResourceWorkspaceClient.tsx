'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ContractorResource, ChecklistItemDef } from '@/lib/resources/catalogue';

interface ResourceWorkspaceClientProps {
  resource: ContractorResource;
}

export function ResourceWorkspaceClient({ resource }: ResourceWorkspaceClientProps) {
  // Initialize form data from resource defaults
  const initialFormData: Record<string, any> = {};
  for (const sec of resource.sections) {
    for (const f of sec.fields) {
      initialFormData[f.id] = f.defaultValue ?? '';
    }
  }

  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemDef[]>(resource.checklistItems || []);
  const [activeTab, setActiveTab] = useState<'workspace' | 'preview'>('workspace');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleChecklistStatus = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextStatus = item.status === 'passed' ? 'in_progress' : item.status === 'in_progress' ? 'failed' : 'passed';
        return { ...item, status: nextStatus };
      })
    );
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const res = await fetch(`/api/resources/${resource.slug}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          checklists: checklistItems,
          tableRows: resource.defaultTableRows,
        }),
      });

      if (!res.ok) throw new Error('PDF export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.code}_${resource.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`PDF Export Error: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const res = await fetch(`/api/resources/${resource.slug}/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          checklists: checklistItems,
          tableRows: resource.defaultTableRows,
        }),
      });

      if (!res.ok) throw new Error('DOCX export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.code}_${resource.slug}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`DOCX Export Error: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/resources" className="text-slate-500 hover:text-sky-600 uppercase tracking-wider font-bold">
              ← Resources Library
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sky-600 uppercase font-bold tracking-wider">{resource.categoryName}</span>
            <span className="text-slate-300">/</span>
            <span className="px-1.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 font-bold uppercase text-[10px] rounded-sm">
              {resource.code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-800 tracking-tight">
            {resource.title}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {resource.shortDescription}
          </p>
        </div>

        {/* Primary Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm rounded-[4px]"
          >
            {isExportingPdf ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
          >
            {isExportingDocx ? 'Exporting...' : 'Download Word (DOCX)'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
          >
            Print
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden border-b border-slate-200 gap-1 print:hidden">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 py-2 text-xs font-bold uppercase ${
            activeTab === 'workspace' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-400'
          }`}
        >
          Form Inputs
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-bold uppercase ${
            activeTab === 'preview' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-400'
          }`}
        >
          Document Preview
        </button>
      </div>

      {/* Main Workspace Layout (Two-Column on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Interactive Form Inputs */}
        <div
          className={`lg:col-span-6 space-y-6 print:hidden ${
            activeTab === 'preview' ? 'hidden sm:block' : 'block'
          }`}
        >
          <div className="bg-white border border-slate-200 shadow-sm p-6 space-y-6 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Configuration &amp; Details
              </h2>
              <span className="text-[11px] text-slate-400">Live Updating Preview</span>
            </div>

            {/* Sections */}
            {resource.sections.map((section) => (
              <div key={section.id} className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">{section.description}</p>
                )}

                <div className="space-y-3.5">
                  {section.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {field.label} {field.required && <span className="text-sky-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none leading-relaxed transition-colors rounded-[4px]"
                        />
                      ) : field.type === 'select' && field.options ? (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 px-3 py-2 text-xs text-slate-800 outline-none transition-colors rounded-[4px]"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors rounded-[4px]"
                        />
                      )}
                      {field.helperText && (
                        <span className="text-[10px] text-slate-400 block">{field.helperText}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Checklist Inputs (if applicable) */}
            {checklistItems && checklistItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                    Interactive Verification Audit
                  </h3>
                  <span className="text-[10px] text-slate-400">Click to toggle Pass / Pending</span>
                </div>
                <div className="space-y-2">
                  {checklistItems.map((item) => {
                    const isPassed = item.status === 'passed';
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistStatus(item.id)}
                        className="p-2.5 bg-slate-50 border border-slate-200 hover:border-sky-300 cursor-pointer flex items-start gap-3 transition-colors text-xs rounded-[4px]"
                      >
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0 border rounded-sm ${
                            isPassed
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-amber-50 border-amber-300 text-amber-700'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-800 leading-snug">{item.requirement}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            {item.category} • Responsible: {item.responsibleParty}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Commercial Document Preview */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            activeTab === 'workspace' ? 'hidden sm:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1 print:hidden">
            <span>LIVE COMMERCIAL DOCUMENT PREVIEW</span>
            <span className="text-slate-400 font-normal">US Letter 8.5 x 11 Format</span>
          </div>

          {/* Document Sheet Card */}
          <div className="bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Sheet Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                    {formData.companyName || 'Vance Commercial Electric LLC'}
                  </h2>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {formData.primaryTrade || 'Commercial Specialty Contractor'} • Licensed in {formData.statesLicensed || 'Texas'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-sky-700 uppercase tracking-wider">
                    {resource.code}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">
                    {resource.categoryName}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <span className="font-bold text-slate-900">{resource.title}</span>
                <span>Standard: {resource.standard}</span>
              </div>
            </div>

            {/* Document Content Sections */}
            {resource.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-2.5 py-1 border-l-2 border-slate-900">
                  {section.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-800 pt-1">
                  {section.fields.map((f) => {
                    const val = formData[f.id] || '—';
                    return (
                      <div key={f.id} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">
                          {f.label}:
                        </span>
                        <span className="text-slate-900 whitespace-pre-line leading-relaxed font-medium">
                          {String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Verification Checklist Render */}
            {checklistItems && checklistItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-2.5 py-1 border-l-2 border-slate-900">
                  VERIFICATION AUDIT ITEMS
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-xs border text-center text-[9px] font-bold leading-3 ${
                            item.status === 'passed'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'text-slate-300 border-slate-400'
                          }`}
                        >
                          {item.status === 'passed' ? '✓' : ''}
                        </span>
                        <span className="text-slate-800">{item.requirement}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">
                        {item.responsibleParty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-300 space-y-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                COMMERCIAL EXECUTION &amp; AUTHORIZATION
              </div>
              <div className="grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div className="space-y-4">
                  <div className="border-b border-slate-400 pt-6"></div>
                  <div className="text-[10px] text-slate-500 font-medium">Authorized Contractor Signature / Date</div>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-slate-400 pt-6"></div>
                  <div className="text-[10px] text-slate-500 font-medium">Client / General Contractor Acceptance / Date</div>
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>{resource.disclaimer}</span>
              <span className="font-bold text-slate-500 shrink-0">AVORRIA CONTRACTOR OPERATING SYSTEM</span>
            </div>
          </div>

          {/* Connect to Workspace Box */}
          <div className="bg-sky-50 border border-sky-200 p-5 space-y-3 print:hidden rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-800 uppercase">Connect to Avorria Workspace</span>
              <span className="text-[10px] text-sky-600 font-bold uppercase">Cloud Archive</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Save this {resource.title} directly into your organization&apos;s verified Document Vault. Attach it to commercial bid submissions or project startup dossiers.
            </p>
            <div className="pt-1">
              <Link
                href="/workspace/documents"
                className="inline-block px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-[4px]"
              >
                Save to Workspace Vault →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
