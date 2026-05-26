import React from 'react';
import { cn } from '@/lib/utils';
import { TokenConfig } from '@/lib/data/tokens';
import { isValidDecimalInput } from '@/lib/utils/currency';
import { PercentageSelectors } from './percentage-selectors';

interface SwapBlockProps {
  label: 'From' | 'To';
  token: TokenConfig;
  amount: string;
  onAmountChange: (val: string) => void;
  equivalentFiat: string;
  showPercentages?: boolean;
  activePercentage?: number | null;
  onPercentageSelect?: (percentage: number) => void;
}

export function SwapBlock({
  label,
  token,
  amount,
  onAmountChange,
  equivalentFiat,
  showPercentages = false,
  activePercentage = null,
  onPercentageSelect,
}: SwapBlockProps) {
  return (
    <div className="border border-neutral-200 rounded-md p-6 flex flex-col gap-3">
      {/* Top Row: Label & Percentages */}
      <div className="flex items-center justify-between">
        <span className="text-neutral-500 font-medium text-[14px]">{label}</span>
        {showPercentages && onPercentageSelect && (
          <PercentageSelectors
            activePercentage={activePercentage}
            onSelect={onPercentageSelect}
          />
        )}
      </div>

      {/* Middle Row: Selectors & Input */}
      <div className="flex gap-3">
        {/* Token Selector Pill */}
        <button className="flex items-center justify-between gap-3 px-3 py-2.5 border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 transition-colors shrink-0 w-[130px]">
          <div className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", token.logoBg)}>
              <i className={cn(token.logoIcon, "text-[11px] mt-0.5")}></i>
            </div>
            <span className="font-semibold text-black text-sm">{token.symbol}</span>
          </div>
          <i className="fi fi-rr-angle-small-down text-neutral-400 mt-0.5"></i>
        </button>

        {/* Amount Input */}
        <div className="flex-grow border border-neutral-200 rounded-md bg-white overflow-hidden flex items-center px-3 py-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (isValidDecimalInput(val)) {
                onAmountChange(val);
              }
            }}
            placeholder="0"
            className="w-full bg-transparent border-none outline-none text-[22px] font-medium text-black placeholder:text-neutral-300"
          />
        </div>
      </div>

      {/* Bottom Row: Fiat Equivalent */}
      <div className="flex justify-end mt-1 pr-1">
        <span className="text-neutral-600 font-medium text-[15px]">
          Equal to = {equivalentFiat}
        </span>
      </div>
    </div>
  );
}
