'use client';

import { useState } from 'react';
import { ChartHeader } from '@/components/balance/chart-header';
import { BalanceChart } from '@/components/balance/balance-chart';
import { TransferCard } from '@/components/balance/transfer-card';
import { IdrBalanceCard } from '@/components/balance/idr-balance-card';
import { TOKENS } from '@/lib/data/tokens';

export default function BalancePage() {
  const [activeTokenId, setActiveTokenId] = useState('XLM');
  const token = TOKENS[activeTokenId];

  const toggleToken = () => {
    setActiveTokenId((prev) => (prev === 'XLM' ? 'USDC' : 'XLM'));
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-black">My Balance</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage and track your token balances across different networks.
        </p>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full overflow-hidden">
        <ChartHeader token={token} onToggleToken={toggleToken} />
        <BalanceChart data={token.chartData} />
      </div>

      {/* Phase 2: Lower Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TransferCard />
        </div>
        <div>
          <IdrBalanceCard />
        </div>
      </div>
    </div>
  );
}
