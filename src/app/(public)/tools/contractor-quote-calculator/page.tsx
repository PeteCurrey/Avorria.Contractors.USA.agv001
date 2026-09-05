import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { PublicQuoteCalculatorClient } from './PublicQuoteCalculatorClient';

export const metadata: Metadata = {
  title: 'Free Contractor Quote & Margin Calculator | Avorria',
  description:
    'Calculate commercial job estimates, labor burden, overhead markups, and target profit margins. Download professional branded PDF quotes instantly.',
  alternates: {
    canonical: `${siteConfig.url}/tools/contractor-quote-calculator`,
  },
};

export default function ContractorQuoteCalculatorPage() {
  return <PublicQuoteCalculatorClient />;
}
