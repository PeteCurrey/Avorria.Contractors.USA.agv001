import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-subtle text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-white mb-3">
              <span className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center font-black text-white text-xs">
                AV
              </span>
              {siteConfig.name}
            </div>
            <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="text-xs text-slate-500">
              Operating market: {siteConfig.defaultCountry} (United States).
            </p>
          </div>

          {/* Nav Pillars */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2">
              {siteConfig.footerNav.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Templates & Tools</h4>
            <ul className="space-y-2">
              {siteConfig.footerNav.templates.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              {siteConfig.footerNav.tools.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Resources & Legal</h4>
            <ul className="space-y-2">
              {siteConfig.footerNav.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
              {siteConfig.footerNav.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Regulatory & Disclaimer Box */}
        <div className="pt-8 border-t border-surface-border text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            <strong className="text-slate-300">Regulatory & Compliance Notice:</strong> {siteConfig.name} is an independent software and operating documentation platform. {siteConfig.name} is not a government licensing board, insurance underwriter, legal advisor, or an enforcement division of the Occupational Safety and Health Administration (OSHA). Compliance assessments, templates, and Contractor Readiness Scores represent operational completion against platform checklists and do not guarantee regulatory immunity or statutory compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-slate-400">
            <p>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
            <p>US Terms & Jurisdictions: OSHA 1926/1910 Aligned.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
