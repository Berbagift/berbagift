import React from 'react';
import { SwapIcon } from '@/components/ui/swap-icon';
import { cn } from '@/lib/utils';

interface BalanceHeaderCardProps {
  balance: number;
  symbol: string;
  equivalentIdr: number;
  onToggleToken: () => void;
  className?: string;
}

export function BalanceHeaderCard({
  balance,
  symbol,
  equivalentIdr,
  onToggleToken,
  className
}: BalanceHeaderCardProps) {
  return (
    <div className={cn("border border-border rounded-md p-5 bg-white dark:bg-card flex items-center justify-between shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]", className)}>
      <div className="flex flex-col gap-1">
        <span className="text-neutral-8 font-medium text-sm">My Balance</span>
        <div className="flex items-baseline md:items-center gap-2 md:gap-3 flex-wrap">
          <h2 className="text-2xl md:text-3xl font-semibold text-black dark:text-neutral-1 tracking-tight leading-none">
            {balance.toLocaleString('id-ID', { minimumFractionDigits: 2 })} {symbol}
          </h2>
          <div className="bg-[#f3e8ff] text-[#9333ea] px-2.5 py-1 rounded-md text-xs md:text-sm font-medium whitespace-nowrap">
            = Rp{equivalentIdr.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleToken}
        className="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 hover:bg-neutral-2 active:bg-neutral-3 transition-colors text-[13px] font-medium text-black dark:text-neutral-1 shrink-0 cursor-pointer"
      >
        <SwapIcon className="w-[12px] h-[12px]" />
        Change token
      </button>
    </div>
  );
}
