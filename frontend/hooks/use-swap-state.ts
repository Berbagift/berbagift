import { useState } from 'react';
import { TOKENS } from '@/lib/data/tokens';
import { 
  parseAmount, 
  formatAmount, 
  calculateConversion, 
  getFiatEquivalent 
} from '@/lib/utils/currency';

export function useSwapState() {
  const [fromTokenId, setFromTokenId] = useState<string>('XLM');
  const [toTokenId, setToTokenId] = useState<string>('USDC');
  
  const [fromAmount, setFromAmount] = useState<string>('245,75');
  const [toAmount, setToAmount] = useState<string>('345,65');
  
  const [activePercentage, setActivePercentage] = useState<number | null>(50);

  const fromToken = TOKENS[fromTokenId];
  const toToken = TOKENS[toTokenId];

  // The active balance token shown at the top
  const [activeBalanceTokenId, setActiveBalanceTokenId] = useState<string>('XLM');
  const activeBalanceToken = TOKENS[activeBalanceTokenId];

  const handleSwapDirection = () => {
    setFromTokenId(toTokenId);
    setToTokenId(fromTokenId);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setActivePercentage(null);
  };

  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    setActivePercentage(null);
    
    const numVal = parseAmount(val);
    setToAmount(calculateConversion(numVal, fromTokenId, toTokenId));
  };

  const handleToAmountChange = (val: string) => {
    setToAmount(val);
    setActivePercentage(null);
    
    const numVal = parseAmount(val);
    setFromAmount(calculateConversion(numVal, toTokenId, fromTokenId));
  };

  const handlePercentage = (percentage: number) => {
    setActivePercentage(percentage);
    const calculatedAmountNum = (fromToken.balance * percentage) / 100;
    const calculatedAmountStr = calculatedAmountNum.toFixed(2);
    
    setFromAmount(formatAmount(calculatedAmountStr));
    setToAmount(calculateConversion(calculatedAmountNum, fromTokenId, toTokenId));
  };

  const [status, setStatus] = useState<'form' | 'error' | 'success' | 'processing'>('form');

  // =========================================================================
  // DEV MOCK CONFIGURATION
  // - Set IS_DEV_MODE to true to auto-simulate transitions (Processing -> Success)
  // - Set IS_DEV_MODE to false for testing real API endpoints/backend status integration
  // =========================================================================
  const IS_DEV_MODE = true;

  const handleSwapSubmit = () => {
    setStatus('processing');
    if (IS_DEV_MODE) {
      setTimeout(() => {
        setStatus('success');
      }, 2000);
    }
  };

  const toggleActiveBalanceToken = () => {
    setActiveBalanceTokenId(prev => prev === fromTokenId ? toTokenId : fromTokenId);
  };

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    activePercentage,
    activeBalanceToken,
    status,
    setStatus,
    handleSwapDirection,
    handleFromAmountChange,
    handleToAmountChange,
    handlePercentage,
    toggleActiveBalanceToken,
    getFiatEquivalent,
    handleSwapSubmit,
  };
}
