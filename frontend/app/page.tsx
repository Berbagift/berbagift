"use client";

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingShowcase } from '@/components/landing/LandingShowcase';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingCelebration } from '@/components/landing/LandingCelebration';
import { LandingStellar } from '@/components/landing/LandingStellar';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="relative bg-[#FFFDFE] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 antialiased">

      {/* === ATMOSPHERIC BACKGROUND === */}
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <div
          className="absolute -top-[10%] -right-[8%] w-[50%] h-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 55% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-[5%] -left-[5%] w-[40%] h-[40%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 60%, rgba(5, 150, 105, 0.035) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-[50%] left-[20%] w-[30%] h-[30%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.02) 0%, transparent 65%)',
          }}
        />
      </div>

      <LandingNavbar />
      <div className="overflow-x-clip relative w-full">
        <LandingHero />
        <LandingShowcase />
        <LandingHowItWorks />
        <LandingCelebration />
        <LandingStellar />
        <LandingCTA />
        <LandingFooter />
      </div>
    </div>
  );
}
