import Image from 'next/image';
import { ChartRangeTabs } from '@/components/balance/chart-range-tabs';
import { TokenConfig } from '@/lib/data/tokens';
import { SwapIcon } from '../ui/swap-icon';

interface ChartHeaderProps {
  token: TokenConfig;
  onToggleToken: () => void;
}

export function ChartHeader({ token, onToggleToken }: ChartHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-6 w-full">
      {/* Left side: Balance Information */}
      <div className="flex flex-col">
        <h2 className="text-sm font-medium text-neutral-8 mb-4">
          {token.symbol} Performance & Wallet Balance
        </h2>

        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className={`${token.logoBg} rounded-full flex items-center justify-center w-16 h-16 shrink-0 text-white mt-1`}>
            <i className={`fi ${token.logoIcon} text-2xl`}></i>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl md:text-[44px] font-semibold text-black dark:text-neutral-1 tracking-tight leading-none mb-3">
              {token.balance.toLocaleString()} {token.symbol}
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-base sm:text-lg text-neutral-8 font-medium">
                Equal to <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-300 px-2 py-0.5 rounded-md ml-1 inline-block">Rp{token.equivalentIdr.toLocaleString()}</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400">
                +{token.percentageChange}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Controls */}
      <div className="flex flex-col items-start md:items-end justify-between gap-6">
        <button
          onClick={onToggleToken}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black dark:text-neutral-1 border border-border rounded-md hover:bg-neutral-2 transition-colors"
        >
          <SwapIcon></SwapIcon>
          Change token
        </button>

        <ChartRangeTabs />
      </div>
    </div>
  );
}
