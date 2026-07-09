"use client";

import React from 'react';
import { BalanceCard } from './balance-card';
import { useCryptoPrices } from '@/lib/api/queries/prices';

export function BalanceSection() {
  const { data: prices, isLoading } = useCryptoPrices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, idx) => (
          <div 
            key={idx} 
            className="flex flex-col p-5 rounded-md border border-border bg-emerald-50/50 dark:bg-emerald-900/10 shadow-none animate-pulse"
          >
            <div className="flex items-center gap-4 h-full">
              <div className="w-14 h-14 rounded-full bg-emerald-100/80 dark:bg-emerald-800/30 flex-shrink-0" />
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center justify-between w-full">
                  <div className="h-4 w-20 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
                  <div className="h-5 w-12 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
                </div>
                <div className="h-8 w-28 bg-emerald-100/80 dark:bg-emerald-800/30 rounded my-1" />
                <div className="h-4 w-32 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Dummy balances for display
  const xlmAmount = 2550.75;
  const usdcAmount = 150.00;
  
  // Real-time prices from CoinGecko (fallback to 1600/16000 if network fails)
  const xlmPriceIdr = prices?.stellar?.idr || 1600;
  const usdcPriceIdr = prices?.['usd-coin']?.idr || 16000;
  
  // 24-hour price change percentage
  const xlm24hChange = prices?.stellar?.idr_24h_change || 0;
  const usdc24hChange = prices?.['usd-coin']?.idr_24h_change || 0;

  // Calculate Equal To IDR dynamically
  const xlmIdr = xlmAmount * xlmPriceIdr;
  const usdcIdr = usdcAmount * usdcPriceIdr;
  const totalIdr = xlmIdr + usdcIdr;
  const totalXlmEquivalent = xlmPriceIdr > 0 ? (totalIdr / xlmPriceIdr) : 0;
  
  // Total THR Received (Dummy IDR amount converted back to XLM based on current price)
  const thrReceivedIdr = 4500000;
  const thrReceivedXlm = xlmPriceIdr > 0 ? (thrReceivedIdr / xlmPriceIdr) : 0;
  
  // Helper to format percentage with sign
  const formatPercentage = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const balanceData = [
    {
      title: 'XLM Balance',
      amount: `${xlmAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`,
      subtitle: `Equal to Rp ${xlmIdr.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,
      symbol: 'XLM',
      percentage: formatPercentage(xlm24hChange),
      percentageType: xlm24hChange >= 0 ? 'positive' as const : 'negative' as const,
    },
    {
      title: 'USDC Balance',
      amount: `${usdcAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      subtitle: `Equal to Rp ${usdcIdr.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,
      symbol: 'USDC',
      percentage: formatPercentage(usdc24hChange),
      percentageType: usdc24hChange >= 0 ? 'positive' as const : 'negative' as const,
    },
    {
      title: 'IDR Balance',
      amount: `Rp ${totalIdr.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,
      subtitle: `Equal to ${totalXlmEquivalent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`,
      symbol: 'IDR',
    },
    {
      title: 'Total THR Received',
      amount: `Rp ${thrReceivedIdr.toLocaleString('id-ID')}`,
      subtitle: `Equal to ${thrReceivedXlm.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`,
      symbol: 'THR',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {balanceData.map((data, idx) => (
        <BalanceCard key={idx} {...data} />
      ))}
    </div>
  );
}
