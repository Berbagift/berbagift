import React from 'react';
import { cn } from '@/lib/utils';

interface TokenLogoProps {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function TokenLogo({ symbol, className, size = 'md' }: TokenLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const sym = symbol.toUpperCase();

  if (sym === 'XLM') {
    return (
      <img 
        src="/logo/XLMlogo.svg" 
        alt="XLM" 
        className={cn("object-contain select-none flex-shrink-0", sizeClasses[size], className)} 
      />
    );
  }

  if (sym === 'USDC') {
    return (
      <img 
        src="/logo/USDClogo.svg" 
        alt="USDC" 
        className={cn("object-contain select-none flex-shrink-0", sizeClasses[size], className)} 
      />
    );
  }

  if (sym === 'IDR') {
    return (
      <div className={cn("rounded-full flex items-center justify-center flex-shrink-0 bg-[#fffbeb] text-[#f59e0b] dark:bg-amber-950/30 dark:text-amber-500 select-none", sizeClasses[size], className)}>
        <i className="fi fi-rr-money-bill-wave text-2xl mt-1" />
      </div>
    );
  }

  if (sym === 'THR') {
    return (
      <div className={cn("rounded-full flex items-center justify-center flex-shrink-0 bg-[#f6eefe] text-[#a855f7] dark:bg-purple-950/30 dark:text-purple-400 select-none", sizeClasses[size], className)}>
        <i className="fi fi-rr-gift text-2xl mt-1" />
      </div>
    );
  }

  return null;
}
