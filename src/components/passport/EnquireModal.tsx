'use client';

import React, { useState } from 'react';

interface Props {
  contractorSlug: string;
  contractorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EnquireModal({ contractorSlug, contractorName, isOpen, onClose }: Props) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contractor/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorSlug,
          senderName,
          senderEmail,
          senderPhone: senderPhone || undefined,
          projectType: projectType || undefined,
          projectLocation: projectLocation || undefined,
          message,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to deliver enquiry. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError('A network error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSenderName('');
    setSenderEmail('');
    setSenderPhone('');
    setProjectType('');
    setProjectLocation('');
    setMessage('');
    setHoneypot('');
    setError(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Direct Project Enquiry
            </div>
            <h3 className="text-lg font-bold text-navy-900">{contractorName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h4 className="text-xl font-bold text-navy-900">Enquiry Delivered</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your message has been delivered directly to <strong>{contractorName}</strong>. The contractor will review your project scope and respond to <strong>{senderEmail}</strong>.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Anti-spam Honeypot (Hidden from human users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="hp_enq_field">Leave this empty</label>
              <input
                id="hp_enq_field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Your Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@acmebuild.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. (512) 555-0199"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Project Location</label>
                <input
                  type="text"
                  placeholder="e.g. Austin, TX"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Trade or Scope Type</label>
              <input
                type="text"
                placeholder="e.g. Commercial Electrical Service Upgrade"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Project Details / Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your project timeline, scope of work, or qualifications required..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              🔒 <strong>Privacy Protected:</strong> Your enquiry is routed directly into the contractor’s private Avorria workspace. Avorria does not sell contractor leads or broadcast your contact details.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {submitting ? 'Sending...' : 'Send Direct Enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
