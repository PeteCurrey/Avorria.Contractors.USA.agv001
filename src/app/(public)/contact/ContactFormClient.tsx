'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ContactFormClient() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    trade: 'electrical',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate reliable submission / validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please complete all required fields.');
      setLoading(false);
      return;
    }

    try {
      // Small simulated delay for feedback
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
    } catch {
      setError('Unable to send your message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-normal text-navy-900 tracking-tight">
          Message Received
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-extralight">
          Thank you for contacting Avorria. An operations specialist will review your inquiry and follow up within one business day.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', company: '', email: '', trade: 'electrical', message: '' });
            }}
          >
            Send Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name *"
          placeholder="Marcus Vance"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Company Name"
          placeholder="Apex Electrical Solutions LLC"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Business Email *"
          type="email"
          placeholder="owner@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Select
          label="Primary Trade Classification"
          value={formData.trade}
          onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
          options={[
            { value: 'electrical', label: 'Commercial Electrical (NAICS 238210)' },
            { value: 'hvac', label: 'HVAC & Mechanical (NAICS 238220)' },
            { value: 'plumbing', label: 'Commercial Plumbing (NAICS 238220)' },
            { value: 'roofing', label: 'Commercial Roofing (NAICS 238160)' },
            { value: 'gc', label: 'General Contractor (NAICS 236220)' },
            { value: 'steel', label: 'Structural Steel & Rigging (NAICS 238120)' },
            { value: 'other', label: 'Specialty Trade' },
          ]}
        />
      </div>

      <Textarea
        label="Project or Operational Inquiry *"
        placeholder="How can Avorria support your contracting business operations, compliance tracking, or bidding pre-qualification?"
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />

      <div className="pt-2">
        <Button
          type="submit"
          size="md"
          variant="primary"
          className="w-full"
          isLoading={loading}
        >
          Submit Inquiry
        </Button>
      </div>

      <p className="text-[11px] text-slate-500 text-center font-extralight pt-1">
        We respect contractor privacy. Submissions are processed exclusively by Avorria personnel.
      </p>
    </form>
  );
}
