import React from 'react';
import { BalanceCard } from './balance-card';

const BALANCE_DATA = [
  {
    title: 'XLM Balance',
    amount: '565.76 XLM',
    subtitle: 'Equal to Rp 1,565,999',
    logoSrc: 'https://placehold.co/80x80/000000/FFFFFF?text=XLM',
    percentage: '+10%',
    percentageType: 'positive' as const,
  },
  {
    title: 'USDC Balance',
    amount: '895.76 USDC',
    subtitle: 'Equal to Rp 2,565,999',
    logoSrc: 'https://placehold.co/80x80/2563EB/FFFFFF?text=USDC',
    percentage: '-8%',
    percentageType: 'negative' as const,
  },
  {
    title: 'IDR Balance',
    amount: 'Rp 1.595.000',
    subtitle: 'Equal to 325.30 XLM',
    logoSrc: 'https://placehold.co/80x80/F59E0B/FFFFFF?text=IDR',
  },
  {
    title: 'Total THR Received',
    amount: 'Rp 4.500.000',
    subtitle: 'Equal to 545.75 XLM',
    logoSrc: 'https://placehold.co/80x80/A855F7/FFFFFF?text=THR',
  },
];

export function BalanceSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {BALANCE_DATA.map((data, idx) => (
        <BalanceCard key={idx} {...data} />
      ))}
    </div>
  );
}
