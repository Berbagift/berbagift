'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { ChartHeader } from '@/components/balance/chart-header';
import { TransferCard } from '@/components/balance/transfer-card';
import { IdrBalanceCard } from '@/components/balance/idr-balance-card';
import { TopUpBalanceModal } from '@/components/balance/top-up-balance-modal';
import { LightweightChart } from '@/components/balance/lightweight-chart';
import ChartComponent from '@/components/balance/chart-token';
import { TOKENS } from '@/lib/data/tokens';
import { useTokens } from '@/lib/api/queries';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function BalancePage() {
  const [activeTokenId, setActiveTokenId] = useState('XLM');
  const [activeRange, setActiveRange] = useState('1 Month');
  const [chartMode, setChartMode] = useState<'pro' | 'area'>('area');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const { data: tokenList } = useTokens();
  const { data: userProfile } = useUserProfile();

  console.log(userProfile);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTabletRange = useMediaQuery({
    minWidth: 1024,
    maxWidth: 1532,
  });

  const isTabletLayout = mounted && isTabletRange;

  const tokenMap = useMemo(() => {
    const map = Object.fromEntries(
      (tokenList ?? Object.values(TOKENS)).map((token) => [
        token.id,
        { ...token },
      ])
    );

    if (userProfile?.balances) {
      if (map['XLM']) {
        map['XLM'].balance = userProfile.balances.XLM ?? 0;
        map['XLM'].equivalentIdr =
          userProfile.balances_idr?.XLM ?? 0;
      }

      if (map['RPK']) {
        map['RPK'].balance = userProfile.balances.RPK ?? 0;
        map['RPK'].equivalentIdr =
          userProfile.balances_idr?.RPK ?? 0;
      }
    }

    return map;
  }, [tokenList, userProfile]);

  const token = tokenMap[activeTokenId] ?? TOKENS[activeTokenId];

  token.balance = userProfile?.balances?.XLM ?? 0;

  const toggleToken = () => {
    setActiveTokenId((prev) => (prev === 'XLM' ? 'RPK' : 'XLM'));
  };

  const rangeMapping: Record<
    string,
    '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '12M' | '60M' | 'ALL'
  > = {
    '1 Day': '1D',
    '1 Week': '5D',
    '1 Month': '1M',
    '1 Year': '12M',
    '3 Year': '60M',
    '5 Year': 'ALL',
  };

  const idrBalance = userProfile?.balances?.RPK ?? 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Main Chart */}
      <div className="bg-white dark:bg-card border border-border rounded-md p-4 sm:p-6 md:p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full overflow-hidden">
        <ChartHeader
          token={token}
          onToggleToken={toggleToken}
          activeRange={activeRange}
          onChangeRange={setActiveRange}
          chartMode={chartMode}
          onChangeChartMode={setChartMode}
        />

        <div className="w-full h-[400px] md:h-[500px]">
          {chartMode === 'pro' ? (
            <ChartComponent
              activeTokenId={activeTokenId}
              activeRange={activeRange}
              rangeMapping={rangeMapping}
            />
          ) : (
            <LightweightChart
              activeTokenId={activeTokenId}
              activeRange={activeRange}
            />
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className={`grid gap-6 ${isTabletLayout
          ? 'grid-cols-1'
          : 'grid-cols-1 md:grid-cols-2'
          }`}
      >
        <TransferCard />

        <IdrBalanceCard
          balance={idrBalance}
          onTopUpClick={() => setIsTopUpOpen(true)}
        />
      </div>

      <TopUpBalanceModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
      />
    </div>
  );
}