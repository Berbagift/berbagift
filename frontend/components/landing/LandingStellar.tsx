"use client";

import React from 'react';

export function LandingStellar() {
  return (
    <section id="stellar" className="py-20 lg:py-24 bg-white relative overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center relative">
        {/* Left — Copy */}
        <div className="lg:col-span-5 space-y-5 z-10">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-slate-800 leading-[1.1]">
            Powered by{' '}
            <span className="text-emerald-600">Stellar.</span>
          </h2>
          <p className="text-base text-slate-400 font-normal leading-relaxed max-w-md">
            Berbagift settles transactions on the Stellar network. Send gifts across borders in seconds with minimal network fees, turning payments into warm social connections.
          </p>
        </div>

        {/* Right — Abstract Brand Composition */}
        <div className="lg:col-span-7 flex items-center justify-center relative h-[440px] lg:h-[500px] z-0">

          {/* Blueprint dot grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 z-0" />

          {/* Mesh gradient base */}
          <div
            className="absolute inset-[8%] rounded-[44%] z-0"
            style={{
              background: `
                radial-gradient(circle at 28% 38%, rgba(16, 185, 129, 0.07) 0%, transparent 50%),
                radial-gradient(circle at 65% 52%, rgba(5, 150, 105, 0.05) 0%, transparent 48%),
                radial-gradient(circle at 48% 48%, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
                radial-gradient(circle at 72% 32%, rgba(168, 85, 247, 0.02) 0%, transparent 48%)
              `,
            }}
          />

          {/* Concentric solid fine rings — blueprint orbits */}
          <div className="absolute w-[200px] h-[200px] md:w-[240px] md:h-[240px] border border-slate-200/50 rounded-full z-10 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] md:w-[350px] md:h-[350px] border border-slate-200/35 rounded-full z-10 pointer-events-none" />
          <div className="absolute w-[400px] h-[400px] md:w-[460px] md:h-[460px] border border-slate-100 rounded-full z-10 pointer-events-none" />



          {/* Orbital SVG — centerpiece, integrated */}
          <svg
            viewBox="0 0 500 500"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="orbitFade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.04" />
              </linearGradient>
              <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Central Glow behind logo */}
            <circle cx="250" cy="250" r="80" fill="url(#centralGlow)" />

            {/* Orbit 1 — outer, dashed */}
            <ellipse cx="250" cy="250" rx="215" ry="95"
              fill="none" stroke="#d1d5db" strokeWidth="0.6"
              transform="rotate(-20 250 250)" strokeDasharray="4 8" opacity="0.5" />
            {/* Orbit 2 — mid, gradient */}
            <ellipse cx="250" cy="250" rx="185" ry="68"
              fill="none" stroke="url(#orbitFade)" strokeWidth="0.8"
              transform="rotate(16 250 250)" />
            {/* Orbit 3 — inner, fine */}
            <ellipse cx="250" cy="250" rx="150" ry="52"
              fill="none" stroke="#d1d5db" strokeWidth="0.45"
              transform="rotate(-8 250 250)" strokeDasharray="3 7" opacity="0.4" />
            {/* Orbit 4 — accent ring */}
            <ellipse cx="250" cy="250" rx="120" ry="40"
              fill="none" stroke="#e2e8f0" strokeWidth="0.35"
              transform="rotate(28 250 250)" strokeDasharray="2 6" opacity="0.35" />

            {/* Constellation nodes */}
            <circle cx="55" cy="148" r="2.5" fill="#10b981" opacity="0.5" />
            <circle cx="445" cy="352" r="3" fill="#10b981" opacity="0.45" />
            <circle cx="408" cy="118" r="2" fill="#34d399" opacity="0.35" />
            <circle cx="68" cy="365" r="2" fill="#34d399" opacity="0.3" />
            <circle cx="238" cy="55" r="1.5" fill="#6ee7b7" opacity="0.25" />
            <circle cx="268" cy="445" r="1.5" fill="#6ee7b7" opacity="0.25" />

            {/* Connections — Clean lines connecting nodes directly to the central Stellar node */}
            <line x1="55" y1="148" x2="250" y2="250" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.3" />
            <line x1="445" y1="352" x2="250" y2="250" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.3" />
            <line x1="408" y1="118" x2="250" y2="250" stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.25" />
            <line x1="68" y1="365" x2="250" y2="250" stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.25" />
            <line x1="238" y1="55" x2="250" y2="250" stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="2 5" opacity="0.2" />
            <line x1="268" y1="445" x2="250" y2="250" stroke="#e2e8f0" strokeWidth="0.4" strokeDasharray="2 5" opacity="0.2" />
          </svg>

          {/* Floating particles */}
          {/* Floating static particles */}
          {[
            { l: '18%', t: '20%', s: 3 },
            { l: '74%', t: '28%', s: 2.5 },
            { l: '30%', t: '70%', s: 2 },
            { l: '82%', t: '62%', s: 2.5 },
            { l: '14%', t: '55%', s: 2 },
            { l: '68%', t: '14%', s: 2 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-450/40 pointer-events-none"
              style={{
                width: p.s,
                height: p.s,
                left: p.l,
                top: p.t,
                opacity: 0.35
              }}
            />
          ))}

          {/* Stellar Logo centerpiece — massive double-layered glass sphere (strictly no rotation animation) */}
          <div className="relative z-20 w-44 h-44 md:w-48 md:h-48 rounded-full bg-white/40 border border-slate-200/30 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-[1.02]">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-white/95 to-slate-50/90 border border-slate-200/50 shadow-[0_15px_35px_rgba(16,185,129,0.06)] flex items-center justify-center">
              <img
                src="/logo/XLMlogo.svg"
                alt="Stellar Logo"
                className="w-18 h-18 md:w-20 md:h-20 object-contain filter drop-shadow-[0_4px_10px_rgba(16,185,129,0.08)]"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Minimal and static styled chart */
      `}</style>
    </section>
  );
}
