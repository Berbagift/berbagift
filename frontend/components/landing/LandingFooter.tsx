"use client";

import React from 'react';

const footerLinks = [
  { label: 'Features', href: '#showcase' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Celebrations', href: '#celebrations' },
  { label: 'Stellar', href: '#stellar' },
];

const externalLinks = [
  { label: 'Stellar.org', href: 'https://stellar.org' },
  { label: 'GitHub', href: 'https://github.com' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/50 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex items-center gap-3">
            <img
              src="/logo/Brandlogo.svg"
              alt="Berbagift"
              className="h-8 w-auto object-contain"
            />
            <span className="font-semibold text-lg tracking-tight text-slate-700">
              Berbagift
            </span>
          </div>

          <div className="flex items-center gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-slate-100 text-center md:text-left">
          <p className="text-[11px] text-slate-300">
            &copy; {new Date().getFullYear()} Berbagift. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
