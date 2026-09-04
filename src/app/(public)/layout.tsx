'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const FULLSCREEN_HERO_ROUTES = new Set([
  '/',
  '/about',
  '/platform',
  '/create',
  '/comply',
  '/prove',
  '/win-work',
  '/contractor-passport',
  '/pricing',
]);

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

  const hasFullscreenHero = FULLSCREEN_HERO_ROUTES.has(pathname);

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
