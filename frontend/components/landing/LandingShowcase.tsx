"use client";

import React from 'react';
import { Send, Layers, Globe } from 'lucide-react';

function BrowserChrome() {
  return (
    <div className="h-9 border-b border-slate-100 bg-slate-50/60 flex items-center px-4 gap-2">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-300/70" />
        <div className="w-2 h-2 rounded-full bg-slate-300/70" />
        <div className="w-2 h-2 rounded-full bg-slate-300/70" />
      </div>
      <div className="flex-1 h-4 bg-white rounded-md border border-slate-200/60 ml-3" />
    </div>
  );
}

export function LandingShowcase() {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  return (
    <section id="showcase" className="py-20 lg:py-24 bg-[#FAFBFA] relative overflow-hidden">

      {/* Subtle ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 relative">
        
        {/* Section Header */}
        <div className="max-w-xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-slate-800 leading-[1.1] text-center">
            The complete <span className="text-emerald-600">gifting</span> experience
          </h2>
          <p className="text-base text-slate-400 font-normal leading-relaxed text-center">
            Everything you need to choose custom-themed envelopes, host community giveaways, and track claims.
          </p>
        </div>
      </div>

      {/* Breakout container for Full HD screenshot mockups to prevent pixelation */}
      <div className="max-w-[1550px] mx-auto px-6 md:px-12 relative mt-10">
        <div 
          className="relative w-full h-[580px] sm:h-[740px] lg:h-[920px]"
          onMouseLeave={() => setHoveredIdx(null)}
        >

          {/* Background Ambient Depth Glow */}
          <div className="absolute inset-x-20 inset-y-10 bg-gradient-to-tr from-emerald-500/5 to-teal-500/3 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Left Screenshot (Medium, Behind & Rotated) */}
          <div
            onMouseEnter={() => setHoveredIdx(0)}
            className={`absolute left-[0%] top-[14%] w-[82%] aspect-[16/9] bg-white rounded-2xl border border-slate-200/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] overflow-hidden group transition-all duration-500 ease-out cursor-pointer ${hoveredIdx === 0
                ? "z-30 rotate-0 scale-[1.08] opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
                : hoveredIdx === null
                  ? "z-10 -rotate-[2.5deg] opacity-90"
                  : "z-10 -rotate-[2.5deg] opacity-35 scale-[0.96] blur-[0.5px] brightness-[0.85]"
              }`}
          >
            <BrowserChrome />
            <div className="absolute inset-x-0 bottom-0 top-9 bg-slate-50">
              <img
                src="/landingpage/preview2.webp"
                alt="Berbagift Personalize and Send"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Right Screenshot (Medium, Behind & Rotated) */}
          <div
            onMouseEnter={() => setHoveredIdx(1)}
            className={`absolute right-[0%] top-[8%] w-[82%] aspect-[16/9] bg-white rounded-2xl border border-slate-200/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] overflow-hidden group transition-all duration-500 ease-out cursor-pointer ${hoveredIdx === 1
                ? "z-30 rotate-0 scale-[1.08] opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
                : hoveredIdx === null
                  ? "z-10 rotate-[2deg] opacity-90"
                  : "z-10 rotate-[2deg] opacity-35 scale-[0.96] blur-[0.5px] brightness-[0.85]"
              }`}
          >
            <BrowserChrome />
            <div className="absolute inset-x-0 bottom-0 top-9 bg-slate-50">
              <img
                src="/landingpage/preview3.webp"
                alt="Berbagift Claim Rooms"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Central Screenshot (Large, Front & Centered) */}
          <div
            onMouseEnter={() => setHoveredIdx(2)}
            className={`absolute left-[6%] top-[2%] w-[88%] aspect-[16/9] bg-white rounded-2xl border border-slate-200/80 shadow-[0_30px_70px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.01)] overflow-hidden group transition-all duration-500 ease-out cursor-pointer ${hoveredIdx === 2
                ? "z-30 scale-[1.06] opacity-100 shadow-[0_40px_80px_rgba(0,0,0,0.12)] animate-none"
                : hoveredIdx === null
                  ? "z-20 opacity-100"
                  : "z-10 opacity-35 scale-[0.95] blur-[0.5px] brightness-[0.85]"
              }`}
          >
            <BrowserChrome />
            <div className="absolute inset-x-0 bottom-0 top-9 bg-slate-50">
              <img
                src="/landingpage/preview1.webp"
                alt="Berbagift Dashboard Overview"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
