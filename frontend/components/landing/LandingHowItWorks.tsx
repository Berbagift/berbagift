"use client";

import React from 'react';
import { Gift, PenLine, SendHorizonal, PartyPopper } from 'lucide-react';

const steps = [
  {
    icon: Gift,
    title: 'Choose Envelope',
    description: 'Select a premium card layout designed to match the moment.',
  },
  {
    icon: PenLine,
    title: 'Customize',
    description: 'Write a personal message and specify the assets to enclose.',
  },
  {
    icon: SendHorizonal,
    title: 'Send',
    description: 'Dispatch the envelope instantly over the Stellar ledger.',
  },
  {
    icon: PartyPopper,
    title: 'Celebrate',
    description: 'Your recipient opens the envelope with real-time feedback.',
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-white relative overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent" />

      <div
        className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.025) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative">
        <div className="max-w-xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-slate-800 leading-[1.1] text-center">
            Gifting, step by step
          </h2>
          <p className="text-base text-slate-400 font-normal leading-relaxed text-center">
            Create, customize, and deliver a digital gift in under a minute. No setup friction.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[44px] left-[7%] right-[7%]">
            <svg className="w-full h-4" viewBox="0 0 800 16" preserveAspectRatio="none" fill="none">
              <line x1="0" y1="8" x2="800" y2="8" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 4" />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-4 group">
                  <div className="relative w-[80px] h-[80px] rounded-2xl bg-emerald-50/70 border border-emerald-100/40 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-100 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-100/30">
                    <Icon className="w-7.5 h-7.5 text-emerald-600" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-slate-200 text-[9px] font-semibold text-slate-400 flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-slate-700 text-[14px]">
                      {step.title}
                    </h3>
                    <p className="text-[12px] text-slate-400 leading-relaxed max-w-[180px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
