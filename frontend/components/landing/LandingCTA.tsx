"use client";

import React from 'react';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';

export function LandingCTA() {
  return (
    <section id="cta" className="py-20 lg:py-24 relative overflow-hidden text-center bg-emerald-50/20">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.04) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-16 space-y-8 relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-[40px] font-semibold tracking-tight text-slate-800 leading-[1.1]">
          Make every gift
          <br />
          more <span className="text-emerald-600">meaningful</span>
        </h2>
        <p className="text-base text-slate-400 font-normal leading-relaxed max-w-lg mx-auto">
          Connect your wallet and send your first digital gift envelope in under a minute.
        </p>

        <div className="inline-flex justify-center pt-2 landing-cta-wrapper">
          <ConnectWalletButton />
        </div>
      </div>

      <style jsx>{`
        .landing-cta-wrapper :global(button) {
          height: 56px !important;
          padding-left: 48px !important;
          padding-right: 48px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          border-radius: 9999px !important;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.22), 0 2px 4px rgba(0, 0, 0, 0.04) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .landing-cta-wrapper :global(button:hover) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 15px 32px rgba(16, 185, 129, 0.28), 0 3px 8px rgba(0, 0, 0, 0.05) !important;
        }
        .landing-cta-wrapper :global(button:active) {
          transform: translateY(0) scale(1) !important;
        }
      `}</style>
    </section>
  );
}
