'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/sign-in' || pathname === '/sign-up';

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // All pages apart from the Resources pages have a full screen hero,
  // except these content-only tool/utility pages which have no hero image.
  const isResourcePage = pathname ? pathname === '/resources' || pathname.startsWith('/resources/') : false;
  const isContentOnlyPage = pathname === '/tools/job-hazard-analysis-jha-generator';
  const hasFullscreenHero = !isResourcePage && !isContentOnlyPage;

  return (
    <>
      <Header />
      <main className={`flex-1 ${!hasFullscreenHero ? 'pt-[72px]' : ''}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}
