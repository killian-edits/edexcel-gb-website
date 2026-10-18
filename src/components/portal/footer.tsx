import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';
import { getAllSubjects } from '@/lib/supabase/supabase-queries';

export async function Footer() {
  const subjects = await getAllSubjects();

  return (
    <footer className="mt-auto border-t border-[#E5E5E5] bg-[#F5F5F0]">
      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-md space-y-3">
            <h4 className="text-base font-bold text-[#1A1A1A]">{siteConfig.name}</h4>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="rounded-md border border-[#E5E5E5] bg-white p-3">
              <p className="text-[11px] text-[#6B6B6B] leading-normal font-mono">
                {siteConfig.disclaimer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Platform</h5>
              <ul className="mt-3 space-y-2 text-sm text-[#6B6B6B]">
                <li><Link href="/" className="hover:text-[#0284C7]">Home</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#0284C7]">Dashboard</Link></li>
                <li><Link href="/resources" className="hover:text-[#0284C7]">Revision Resources</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Subjects</h5>
              <ul className="mt-3 space-y-2 text-sm text-[#6B6B6B]">
                {subjects.slice(0, 6).map((s) => (
                  <li key={s.code}>
                    <Link href={`/subjects/${s.code}`} className="hover:text-[#0284C7]">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Integrity</h5>
              <ul className="mt-3 space-y-2 text-sm text-[#6B6B6B]">
                <li><Link href="/resources" className="hover:text-[#0284C7]">Verified Sources</Link></li>
                <li><Link href="/resources" className="hover:text-[#0284C7]">Methodology</Link></li>
                <li><Link href="/admin" className="hover:text-[#0284C7]">Admin Console</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B6B] gap-4">
          <p>© 2026 {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Historical boundaries do not guarantee future results.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
