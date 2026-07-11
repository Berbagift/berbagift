"use client";

import React from 'react';
import { Monitor, Send, Users, Wallet } from 'lucide-react';

const smallPreviews = [
  { icon: Send, label: 'Create Envelope' },
  { icon: Users, label: 'Community Rooms' },
  { icon: Wallet, label: 'Wallet & Swap' },
];

export function LandingPreview() {
  return (
    <section id="features" className="py-32 lg:py-40 relative overflow-hidden">

      {/* Section ambient lighting */}
      <div
        className="absolute top-1/2 left-0 w-full h-[700px] -translate-y-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 55% 45%, rgba(16, 185, 129, 0.05) 0%, transparent 55%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto space-y-5 mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-[#2D2A26] leading-[1.08]">
            See Berbagift{' '}
            <span className="text-emerald-600">in action</span>
          </h2>
          <p className="text-base md:text-lg text-stone-500 font-normal leading-relaxed max-w-lg">
            Everything you need to create, send, and receive meaningful digital gifts — all in one place.
          </p>
        </div>

        {/* === PRODUCT SHOWCASE — Asymmetrical Editorial Layout === */}
        <div className="relative h-[600px] sm:h-[680px] lg:h-[780px] max-w-5xl mx-auto">

          {/* ── Hero Screenshot — large, centered, floating ── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%] max-w-[540px] z-10">
            <div className="rounded-[28px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.05),0_3px_12px_rgba(0,0,0,0.03)] bg-white">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 relative overflow-hidden">
                {/* Subtle layout hint — sidebar + content */}
                <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-b from-stone-100/50 to-white border-r border-stone-200/30" />
                <div className="absolute inset-[10%] left-[25%] flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/50 flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-emerald-500/60" />
                  </div>
                  <p className="text-xs font-semibold tracking-wider text-stone-400 uppercase">Dashboard</p>
                  <p className="text-[10px] text-stone-300 mt-1">Screenshot placeholder</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Left Preview 1 — floating, rotated ── */}
          <div className="absolute top-[6%] left-[2%] w-[27%] max-w-[200px] z-20 -rotate-[3deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-500">
            <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] bg-white">
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50/50 via-white to-stone-50/30 flex flex-col items-center justify-center p-4 space-y-2">
                <Send className="w-5 h-5 text-emerald-500/60" />
                <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">Create Envelope</span>
              </div>
            </div>
          </div>

          {/* ── Left Preview 2 — below, overlapping preview 1 ── */}
          <div className="absolute bottom-[8%] left-[5%] w-[24%] max-w-[170px] z-30 rotate-[2deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-500">
            <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] bg-white">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-50/40 via-white to-stone-50/30 flex flex-col items-center justify-center p-4 space-y-2">
                <Users className="w-5 h-5 text-emerald-500/60" />
                <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">Community</span>
              </div>
            </div>
          </div>

          {/* ── Right Preview — overlapping hero edge ── */}
          <div className="absolute top-[14%] right-[1%] w-[25%] max-w-[180px] z-20 rotate-[2.5deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-500">
            <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] bg-white">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-50/40 via-white to-stone-50/30 flex flex-col items-center justify-center p-4 space-y-2">
                <Wallet className="w-5 h-5 text-emerald-500/60" />
                <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">Wallet</span>
              </div>
            </div>
          </div>

        </div>

        {/* Subtle footnote */}
        <p className="text-center text-[11px] font-medium text-stone-300 mt-10">
          Interface previews — actual screenshots will be added soon.
        </p>
      </div>
    </section>
  );
}
