'use client';

import React from 'react';
import { UniversalDocumentPayload } from '@/lib/documents/types';

interface DocumentPreviewProps {
  payload: UniversalDocumentPayload;
  generationMethod: 'ai' | 'template' | 'manual';
  referenceNumber: string;
  documentStatus: string;
  versionNumber: number;
  generationModel?: string;
}

export function DocumentPreview({
  payload,
  generationMethod,
  referenceNumber,
  documentStatus,
  versionNumber,
  generationModel,
}: DocumentPreviewProps) {
  return (
    <div className="bg-white text-slate-900 rounded-xl shadow-xl max-w-3xl mx-auto print:shadow-none print:rounded-none print:max-w-none">
      {/* Document Header */}
      <div className="border-b-2 border-slate-800 p-8 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-1">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              {payload.documentType.toUpperCase().replace('-', ' ')} • {referenceNumber}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{payload.title}</h1>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              <span>Issue Date: {payload.issueDate}</span>
              {payload.expiryDate && <span>Valid Until: {payload.expiryDate}</span>}
              <span>Status: <strong>{documentStatus.replace('_', ' ').toUpperCase()}</strong></span>
              <span>Version: v{versionNumber}.0</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400 font-mono">Powered by Avorria</div>
            <div className="text-[10px] text-slate-300 mt-0.5">{generationMethod === 'ai' ? 'AI-Generated Draft' : 'Template-Assisted Draft'}</div>
          </div>
        </div>

        {/* Contractor Identity Block */}
        <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <div className="font-bold text-slate-900 text-sm">{payload.contractor.name}</div>
            {payload.contractor.legalName && payload.contractor.legalName !== payload.contractor.name && (
              <div className="text-slate-500">Legal Name: {payload.contractor.legalName}</div>
            )}
            {payload.contractor.primaryTrade && <div>{payload.contractor.primaryTrade}</div>}
            {payload.contractor.licenseNumber && <div>License: {payload.contractor.licenseNumber}</div>}
          </div>
          <div className="text-slate-600">
            {payload.contractor.phone && <div>Tel: {payload.contractor.phone}</div>}
            {payload.contractor.email && <div>Email: {payload.contractor.email}</div>}
            {payload.contractor.jurisdiction && <div>Jurisdiction: {payload.contractor.jurisdiction}</div>}
          </div>
        </div>

        {/* Project Block */}
        {payload.project && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            <div><span className="font-semibold text-slate-900">Project:</span> {payload.project.name}</div>
            <div><span className="font-semibold text-slate-900">Client:</span> {payload.project.clientName}</div>
            <div><span className="font-semibold text-slate-900">Location:</span> {payload.project.siteLocation}</div>
            {payload.project.projectReference && (
              <div><span className="font-semibold text-slate-900">Ref:</span> {payload.project.projectReference}</div>
            )}
          </div>
        )}
      </div>

      {/* Document Sections */}
      <div className="p-8 space-y-6">
        {payload.sections.map((section) => (
          <div key={section.id} className="space-y-2 break-inside-avoid">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 uppercase tracking-wide">
              {section.title}
            </h3>

            {section.type === 'text' && (
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                {section.content}
              </div>
            )}

            {section.type === 'checklist' && section.checklistData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {section.checklistData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className={`w-4 h-4 rounded border text-center text-[10px] leading-4 font-bold shrink-0 ${item.checked ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-400 text-slate-300'}`}>
                      {item.checked ? '✓' : ''}
                    </span>
                    <span className={item.checked ? '' : 'text-slate-400 line-through'}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'table' && section.tableData && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100">
                      {section.tableData.headers.map((h, i) => (
                        <th key={i} className="border border-slate-200 px-3 py-2 text-left font-bold text-slate-800 text-[10px] uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableData.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50' : ''}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-slate-200 px-3 py-2 text-slate-700 align-top">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {/* Financial Summary */}
        {payload.financialSummary && (
          <div className="border-t-2 border-slate-800 pt-4 mt-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-3">Financial Summary</h3>
            <div className="max-w-xs ml-auto text-xs space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span className="font-mono">${payload.financialSummary.subtotal.toFixed(2)}</span>
              </div>
              {payload.financialSummary.taxRatePercent !== undefined && (
                <div className="flex justify-between text-slate-700">
                  <span>Tax ({payload.financialSummary.taxRatePercent}%)</span>
                  <span className="font-mono">${(payload.financialSummary.taxAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-900 text-sm">
                <span>TOTAL (USD)</span>
                <span className="font-mono">${payload.financialSummary.totalAmount.toFixed(2)}</span>
              </div>
              {payload.financialSummary.paymentTerms && (
                <div className="text-[10px] text-slate-500 text-right pt-1">
                  Payment Terms: {payload.financialSummary.paymentTerms}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sign-Off Block */}
        {payload.signOff.required && (
          <div className="border-t border-slate-200 pt-6 mt-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Authorization & Sign-Off</h3>
            <p className="text-xs text-slate-600 leading-relaxed italic">{payload.signOff.acknowledgmentText}</p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <div className="border-b border-slate-400 pt-8"><div className="text-[10px] text-slate-500 mt-1">Contractor Authorized Signature</div></div>
                <div className="border-b border-slate-400 pt-4"><div className="text-[10px] text-slate-500 mt-1">Printed Name / Date</div></div>
              </div>
              <div className="space-y-6">
                <div className="border-b border-slate-400 pt-8"><div className="text-[10px] text-slate-500 mt-1">Client / Owner Authorized Signature</div></div>
                <div className="border-b border-slate-400 pt-4"><div className="text-[10px] text-slate-500 mt-1">Printed Name / Date</div></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Footer */}
      <div className="border-t border-slate-200 px-8 py-4 text-[10px] text-slate-400 flex justify-between items-start gap-4">
        <div className="max-w-xl leading-relaxed">{payload.disclaimer}</div>
        <div className="text-right shrink-0">
          <div className="font-mono">{referenceNumber} • v{versionNumber}.0</div>
          <div className="text-slate-300 text-[9px] mt-0.5">Generated via Avorria</div>
        </div>
      </div>
    </div>
  );
}
