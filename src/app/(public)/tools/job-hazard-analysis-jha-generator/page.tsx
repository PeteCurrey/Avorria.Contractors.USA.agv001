import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { PublicJhaToolClient } from './PublicJhaToolClient';

export const metadata: Metadata = {
  title: 'Free Job Hazard Analysis (JHA) Generator | Avorria',
  description: 'Interactive OSHA-aligned Job Hazard Analysis tool for US commercial contractors. Build single-use JHA reports or sign up for unlimited branded documents.',
  alternates: {
    canonical: `${siteConfig.url}/tools/job-hazard-analysis-jha-generator`,
  },
};

export default function PublicJhaToolPage() {
  return <PublicJhaToolClient />;
}
