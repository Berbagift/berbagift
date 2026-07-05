import React from 'react';
import { cn } from '@/lib/utils';
import { TokenLogo } from '@/components/ui/token-logo';

export interface BalanceCardProps {
  title: string;
  amount: string;
  subtitle: string;
  symbol: string;
  percentage?: string;
  percentageType?: 'positive' | 'negative';
}

export function BalanceCard({
  title,
  amount,
  subtitle,
  symbol,
  percentage,
  percentageType,
}: BalanceCardProps) {
  return (
    <div className="flex flex-col p-5 rounded-md border border-border bg-card shadow-none">
      <div className="flex items-center gap-4">
        <TokenLogo symbol={symbol} size="xl" />
        
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center justify-between w-full">
            <span className="text-base font-medium text-neutral-7 dark:text-neutral-6">{title}</span>
            {percentage && (
              <div 
                className={cn(
                  "px-2 py-0.5 rounded-md text-xs font-medium",
                  percentageType === 'positive' && "bg-[#eafdf0] text-[#16a34a]",
                  percentageType === 'negative' && "bg-[#fdecec] text-[#ef4444]"
                )}
              >
                {percentage}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-medium text-black dark:text-neutral-1 tracking-tight">{amount}</h3>
          <p className="text-base font-medium text-neutral-7 dark:text-neutral-6 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
