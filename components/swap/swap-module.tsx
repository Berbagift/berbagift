'use client';

import React from 'react';
import { useSwapState } from '@/hooks/use-swap-state';
import { SwapBlock } from './swap-block';
import { SwapIcon } from '@/components/ui/swap-icon';

export function SwapModule() {
  const state = useSwapState();

  return (
    <div className="w-full max-w-[740px] mx-auto bg-white border border-neutral-200 rounded-md p-6 md:p-8 flex flex-col shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">

      {/* Top Balance Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-neutral-500 font-medium text-[15px] mb-1">My Balance</span>
          <div className="flex items-center gap-4">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-black tracking-tight leading-none">
              {state.activeBalanceToken.balance.toLocaleString('id-ID', { minimumFractionDigits: 2 })} {state.activeBalanceToken.symbol}
            </h2>
            <div className="bg-[#f3e8ff] text-[#9333ea] px-2.5 py-1 rounded-md text-sm md:text-[15px] font-medium whitespace-nowrap">
              = Rp{state.activeBalanceToken.equivalentIdr.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <button
          onClick={state.toggleActiveBalanceToken}
          className="flex items-center gap-2 border border-neutral-200 rounded-md px-3 py-1.5 hover:bg-neutral-50 transition-colors text-[14px] font-medium text-black shrink-0 mt-1"
        >
          <SwapIcon className="w-[12px] h-[12px]" />
          Change token
        </button>
      </div>

      {/* Main Swap Form */}
      <div className="flex flex-col gap-2">

        {/* FROM Block */}
        <SwapBlock
          label="From"
          token={state.fromToken}
          amount={state.fromAmount}
          onAmountChange={state.handleFromAmountChange}
          equivalentFiat={state.getFiatEquivalent(state.fromAmount, state.fromToken.id)}
          showPercentages={true}
          activePercentage={state.activePercentage}
          onPercentageSelect={state.handlePercentage}
        />

        {/* Swap Direction Button (Floating Centered) */}
        <div className="flex justify-center py-1.5 relative z-10">
          <button
            onClick={state.handleSwapDirection}
            className="w-12 h-12 bg-white border border-neutral-5 rounded-full flex items-center justify-center text-[#16a34a] hover:bg-neutral-50 hover:scale-105 transition-all shadow-md"
          >
            <SwapIcon className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* TO Block */}
        <SwapBlock
          label="To"
          token={state.toToken}
          amount={state.toAmount}
          onAmountChange={state.handleToAmountChange}
          equivalentFiat={state.getFiatEquivalent(state.toAmount, state.toToken.id)}
        />

      </div>

      {/* Platform Fee Badge */}
      <div className="flex justify-center mt-5 mb-5">
        <div className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-md text-[13px] font-medium">
          <i className="fi fi-rr-shuffle text-[11px]"></i>
          <span>0.5% Platform fee</span>
        </div>
      </div>

      {/* Primary Swap Button */}
      <button className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-md text-[16px] font-medium flex items-center justify-center gap-2 transition-colors shadow-sm mb-4">
        Swap
        <i className="fi fi-rr-exchange mt-0.5"></i>
      </button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-1.5 text-neutral-500">
        <i className="fi fi-rr-shield-check text-[14px] mt-1"></i>
        <span className="text-[13px] font-medium">Your funds are secure and never leave your wallet</span>
      </div>

    </div>
  );
}
