'use client';

import { useState } from 'react';
import { ChartHeader } from '@/components/balance/chart-header';
import { BalanceChart } from '@/components/balance/balance-chart';
import { TransferCard } from '@/components/balance/transfer-card';
import { IdrBalanceCard } from '@/components/balance/idr-balance-card';
import { TopUpBalanceModal } from '@/components/balance/top-up-balance-modal';
import { TOKENS } from '@/lib/data/tokens';
import ChartComponent from '@/components/balance/chart-token';

export default function BalancePage() {
  const [activeTokenId, setActiveTokenId] = useState('XLM');
  const [activeRange, setActiveRange] = useState('1 Month');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const token = TOKENS[activeTokenId];

  const toggleToken = () => {
    setActiveTokenId((prev) => (prev === 'XLM' ? 'USDC' : 'XLM'));
  };

  const rangeMapping: Record<string, "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "12M" | "60M" | "ALL"> = {
    '1 Day': '1D',
    '1 Week': '5D',
    '1 Month': '1M',
    '1 Year': '12M',
    '3 Year': '60M',
    '5 Year': 'ALL'
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Main Chart Container */}
      <div className="bg-white dark:bg-card border border-border rounded-md p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full overflow-hidden">
        <ChartHeader
          token={token}
          onToggleToken={toggleToken}
          activeRange={activeRange}
          onChangeRange={setActiveRange}
        />
        <div className="w-full h-[400px] md:h-[500px]">
          <ChartComponent
            activeTokenId={activeTokenId}
            activeRange={activeRange}
            rangeMapping={rangeMapping}
          />
        </div>
      </div>

      {/* Phase 2: Lower Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TransferCard />
        </div>
        <div>
          <IdrBalanceCard onTopUpClick={() => setIsTopUpOpen(true)} />
        </div>
      </div>

      <TopUpBalanceModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />
    </div>
  );
}
