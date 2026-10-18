import React, { Suspense } from 'react';
import { Header } from '@/components/portal/header';
import { Footer } from '@/components/portal/footer';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA]">
      <Suspense fallback={<div className="h-16 border-b border-[#E5E5E5] bg-white/90" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center text-xs text-[#6B6B6B]">Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <Suspense fallback={<footer className="h-40 border-t border-[#E5E5E5] bg-[#F5F5F0]" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
