"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { ArrowRight } from 'lucide-react';

export function LandingHero() {
  const router = useRouter();
  const { isConnected } = useWalletStore();

  const handleCTA = () => {
    if (isConnected) {
      router.push('/sendthr');
    } else {
      document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">

      {/* Soft radial glows behind the artwork */}
      <div
        className="absolute top-[5%] right-[-5%] w-[55%] h-[80%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 40% 50%, rgba(16, 185, 129, 0.06) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-[10%] right-[15%] w-[35%] h-[40%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10 pt-8 pb-12 lg:py-0">

        {/* Left — Typography */}
        <div className="lg:col-span-6 space-y-7 lg:space-y-9">

          <div className="flex items-center gap-3">
            <span className="w-8 h-[1.5px] bg-emerald-500/60 rounded-full" />
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-emerald-600/80">
              A warmer way to share value
            </span>
          </div>

          <h1 className="text-[clamp(2.75rem,7.5vw,5rem)] font-semibold tracking-tight text-slate-850 leading-[0.96]">
            Gifts worth
            <br />
            <span className="text-emerald-600">celebrating.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-normal leading-relaxed max-w-md">
            Wrap digital gifts in custom, beautiful envelopes and send them with a personal message anywhere in the world—in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            <button
              onClick={handleCTA}
              className="group inline-flex items-center gap-3 h-[52px] px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px] rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            >
              {isConnected ? 'Go to Dashboard' : 'Send a Gift'}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 h-[52px] px-4 text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-colors duration-200 group"
            >
              See how it works
              <span className="text-emerald-500 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>

        {/* Right — Hero Artwork */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-[440px] sm:h-[550px] lg:h-[750px] lg:-my-10 group">
          <img
            src="/landingpage/hero.webp"
            alt="Berbagift Digital Gift Envelope"
            className="w-full h-full object-contain max-w-[660px] lg:max-w-none lg:w-[165%] transition-all duration-700 ease-out group-hover:scale-[1.01]"
          />
          {/* Subtle radial blend overlay to dissolve boundaries into background */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_60%,#FFFDFE_98%)] opacity-50" />
        </div>

      </div>
    </section>
  );
}
