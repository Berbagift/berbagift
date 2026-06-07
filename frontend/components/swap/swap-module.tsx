'use client';

import React from 'react';
import { useSwapState } from '@/hooks/use-swap-state';
import { SwapBlock } from './swap-block';
import { SwapIcon } from '@/components/ui/swap-icon';
import { BalanceHeaderCard } from '@/components/finance/balance-header-card';
import { FeeBadge } from '@/components/finance/fee-badge';
import { ActionSubmitButton } from '@/components/forms/action-submit-button';
import { SecurityNote } from '@/components/finance/security-note';

export function SwapModule() {
  const state = useSwapState();

  return (
    <div className="w-full max-w-[740px] mx-auto bg-white dark:bg-card border border-border rounded-md p-6 md:p-8 flex flex-col shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">

      {/* Top Balance Section */}
      <BalanceHeaderCard
        balance={state.activeBalanceToken.balance}
        symbol={state.activeBalanceToken.symbol}
        equivalentIdr={state.activeBalanceToken.equivalentIdr}
        onToggleToken={state.toggleActiveBalanceToken}
        className="border-none !p-0 shadow-none mb-8"
      />

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
            className="w-12 h-12 bg-white dark:bg-card border border-border rounded-full flex items-center justify-center text-[#16a34a] hover:bg-neutral-2 hover:scale-105 transition-all shadow-md"
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
      <FeeBadge feeText="0.5% Platform fee" className="mt-5 mb-5" />

      {/* Primary Swap Button */}
      <ActionSubmitButton icon="fi-rr-exchange" className="mb-4">
        Swap
      </ActionSubmitButton>

      {/* Security Note */}
      <SecurityNote text="Your funds are secure and never leave your wallet" />

    </div>
  );
}

