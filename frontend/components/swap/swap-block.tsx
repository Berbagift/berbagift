import React from 'react';
import { TokenConfig } from '@/lib/data/tokens';
import { TokenAmountField } from '@/components/forms/token-amount-field';
import { PercentageSelectors } from './percentage-selectors';

interface SwapBlockProps {
  label: 'From' | 'To';
  token: TokenConfig;
  amount: string;
  onAmountChange: (val: string) => void;
  equivalentFiat: string;
  showPercentages?: boolean;
  activePercentage?: number | null;
  onPercentageSelect?: (percentage: number) => void;
  availableTokens?: TokenConfig[];
  onTokenSelect?: (tokenId: string) => void;
}

export function SwapBlock({
  label,
  token,
  amount,
  onAmountChange,
  equivalentFiat,
  showPercentages = false,
  activePercentage = null,
  onPercentageSelect,
  availableTokens,
  onTokenSelect,
}: SwapBlockProps) {
  const topRightAccessory = showPercentages && onPercentageSelect ? (
    <PercentageSelectors
      activePercentage={activePercentage}
      onSelect={onPercentageSelect}
    />
  ) : undefined;

  return (
    <TokenAmountField
      label={label}
      token={token}
      amount={amount}
      onAmountChange={onAmountChange}
      equivalentFiat={equivalentFiat}
      topRightAccessory={topRightAccessory}
      showDropdown={true}
      availableTokens={availableTokens}
      onTokenSelect={onTokenSelect}
      size="md"
    />
  );
}

