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
  const isHome = pathname === '/';

  return (
    <>
      <Header />
      <main className={`flex-1 ${!isHome ? 'pt-[72px]' : ''}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}

