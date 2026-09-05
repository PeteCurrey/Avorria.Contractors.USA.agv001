import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { PublicQuoteCalculatorClient } from './PublicQuoteCalculatorClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Free Contractor Quote & Margin Calculator | Avorria',
  description:
    'Calculate commercial job estimates, labor burden, overhead markups, and target profit margins. Download professional branded PDF quotes instantly.',
  alternates: {
    canonical: `${siteConfig.url}/tools/contractor-quote-calculator`,
  },
};

export default function ContractorQuoteCalculatorPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: `${siteConfig.url}/` },
        { name: 'Contractor Tools', url: `${siteConfig.url}/tools` },
        { name: 'Quote Calculator', url: `${siteConfig.url}/tools/contractor-quote-calculator` },
      ]} />
      <PublicQuoteCalculatorClient />
    </>
  );
}
