import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-12 h-12 rounded bg-surface-card border border-surface-border text-brand-400 flex items-center justify-center mx-auto text-xl font-black">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          The requested page could not be located. It may have been moved, updated, or is currently unpublished.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href="/templates"
            className="bg-surface-card hover:bg-surface-elevated text-slate-300 border border-surface-border text-xs font-medium px-4 py-2 rounded-md transition-colors"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
