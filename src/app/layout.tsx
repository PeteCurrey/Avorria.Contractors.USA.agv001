import type { Metadata, Viewport } from 'next';
import { Work_Sans } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-work-sans',
  weight: ['200', '300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Contractor Operating & Compliance Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'contractor compliance',
    'JHA template',
    'JSA template',
    'construction safety plan',
    'contractor quote generator',
    'contractor proposal template',
    'certificate of insurance tracking',
    'OSHA contractor compliance',
    'contractor passport',
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Contractor Operating & Compliance Platform`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#070c18',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={workSans.variable}>
      <body className="bg-surface-page text-navy-800 antialiased min-h-screen flex flex-col selection:bg-brand-600 selection:text-white font-sans font-extralight">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {children}
      </body>
    </html>
  );
}
