"use client";

import React from 'react';
import Link from 'next/link';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

const navLinks = [
  { label: 'Features', href: '#showcase' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Celebrations', href: '#celebrations' },
  { label: 'Stellar', href: '#stellar' },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFDFE]/80 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-between px-6 md:px-12 lg:px-16">

        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img
              src="/logo/Brandlogo.svg"
              alt="Berbagift"
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-800 group-hover:text-emerald-700 transition-colors">
            Berbagift
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center">
          <ConnectWalletButton />
        </div>

      </div>
    </header>
  );
}
