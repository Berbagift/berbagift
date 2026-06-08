"use client";

import React from 'react';
import { BalanceCard } from './balance-card';
import { useUserProfile } from '@/hooks/use-user-profile';

export function BalanceSection() {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, idx) => (
          <div 
            key={idx} 
            className="flex flex-col p-5 rounded-md border border-border bg-card shadow-none h-[106px] animate-pulse"
          >
            <div className="flex items-center gap-4 h-full">
              <div className="w-16 h-16 rounded-full bg-neutral-2 dark:bg-neutral-8 flex-shrink-0" />
              <div className="flex flex-col flex-1 gap-2">
                <div className="h-4 w-24 bg-neutral-2 dark:bg-neutral-8 rounded" />
                <div className="h-6 w-32 bg-neutral-2 dark:bg-neutral-8 rounded" />
                <div className="h-4 w-28 bg-neutral-2 dark:bg-neutral-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const balances = user?.balances || { XLM: 0.0, USDC: 0.0 };
  const balances_idr = user?.balances_idr || { XLM: 0, USDC: 0 };

  const xlmAmount = balances.XLM;
  const usdcAmount = balances.USDC;

  const xlmIdr = balances_idr.XLM;
  const usdcIdr = balances_idr.USDC;
  
  const totalIdr = xlmIdr + usdcIdr;

  // Calculate equivalent total XLM
  // Average XLM price in IDR if balance is 0 or calculation fails
  const xlmPriceIdr = xlmAmount > 0 ? (xlmIdr / xlmAmount) : 3500;
  const totalXlm = xlmPriceIdr > 0 ? (totalIdr / xlmPriceIdr) : 0;

  const balanceData = [
    {
      title: 'XLM Balance',
      amount: `${xlmAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 5 })} XLM`,
      subtitle: `Equal to Rp ${xlmIdr.toLocaleString('id-ID')}`,
      logoSrc: 'https://placehold.co/80x80/000000/FFFFFF?text=XLM',
    },
    {
      title: 'USDC Balance',
      amount: `${usdcAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
      subtitle: `Equal to Rp ${usdcIdr.toLocaleString('id-ID')}`,
      logoSrc: 'https://placehold.co/80x80/2563EB/FFFFFF?text=USDC',
    },
    {
      title: 'IDR Balance',
      amount: `Rp ${totalIdr.toLocaleString('id-ID')}`,
      subtitle: `Equal to ${totalXlm.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`,
      logoSrc: 'https://placehold.co/80x80/F59E0B/FFFFFF?text=IDR',
    },
    {
      title: 'Total THR Received',
      amount: 'Rp 4.500.000', // Mocked or calculated later
      subtitle: `Equal to ${(4500000 / xlmPriceIdr).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`,
      logoSrc: 'https://placehold.co/80x80/A855F7/FFFFFF?text=THR',
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
