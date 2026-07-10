import { useState, useEffect } from 'react';
import { TOKENS } from '@/lib/data/tokens';
import {
  parseAmount,
  formatAmount,
  getFiatEquivalent
} from '@/lib/utils/currency';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useTokens } from '@/lib/api/queries';
import { buildSwapTx, getReserves } from '@/lib/stellar/swap';

import { submitTransaction } from '@/lib/stellar/transactions';
import { useQueryClient } from '@tanstack/react-query';

export function useSwapState() {
  const queryClient = useQueryClient();
  const { data: userProfile } = useUserProfile();
  const { data: tokenList } = useTokens();
  const [fromTokenId, setFromTokenId] = useState<string>('XLM');
  const [toTokenId, setToTokenId] = useState<string>('RPK');

  const [fromAmount, setFromAmount] = useState<string>('245,75');
  const [toAmount, setToAmount] = useState<string>('345,65');

  const [activePercentage, setActivePercentage] = useState<number | null>(50);
  const [reserves, setReserves] = useState<{ reserveA: number, reserveB: number }>({ reserveA: 5, reserveB: 8000 });

  useEffect(() => {
    getReserves().then(setReserves);
  }, []);

  const calculateAmmConversion = (amountIn: number, fromId: string, toId: string) => {
    if (isNaN(amountIn) || amountIn <= 0) return '';
    if (fromId === toId) return formatAmount(amountIn.toFixed(2));

    const { reserveA, reserveB } = reserves;
    if (reserveA === 0 || reserveB === 0) return '';

    const amountInAfterFee = amountIn * 0.995;
    let amountOut = 0;

    if (fromId === 'XLM' && toId === 'RPK') {
      amountOut = (amountInAfterFee * reserveB) / (reserveA + amountInAfterFee);
    } else if (fromId === 'RPK' && toId === 'XLM') {
      amountOut = (amountInAfterFee * reserveA) / (reserveB + amountInAfterFee);
    }

    return formatAmount(amountOut.toFixed(2));
  };

  const calculateAmmConversionInverse = (amountOut: number, fromId: string, toId: string) => {
    if (isNaN(amountOut) || amountOut <= 0) return '';
    if (fromId === toId) return formatAmount(amountOut.toFixed(2));

    const { reserveA, reserveB } = reserves;
    if (reserveA === 0 || reserveB === 0) return '';

    let amountIn = 0;
    if (fromId === 'XLM' && toId === 'RPK') {
      if (amountOut >= reserveB) return '';
      amountIn = (reserveA * amountOut) / ((reserveB - amountOut) * 0.995);
    } else if (fromId === 'RPK' && toId === 'XLM') {
      if (amountOut >= reserveA) return '';
      amountIn = (reserveB * amountOut) / ((reserveA - amountOut) * 0.995);
    }

    return formatAmount(amountIn.toFixed(2));
  };

  const tokenMap = Object.fromEntries(
    (tokenList ?? Object.values(TOKENS)).map((token) => [token.id, { ...token }])
  );

  if (userProfile?.balances) {
    if (tokenMap['XLM']) {
      tokenMap['XLM'].balance = userProfile.balances.XLM;
      tokenMap['XLM'].equivalentIdr = userProfile.balances_idr?.XLM || 0;
    }
    if (tokenMap['RPK']) {
      tokenMap['RPK'].balance = userProfile.balances.RPK || 0;
      tokenMap['RPK'].equivalentIdr = userProfile.balances_idr?.RPK || 0;
    }
  }

  const fromToken = tokenMap[fromTokenId] ?? TOKENS[fromTokenId];
  const toToken = tokenMap[toTokenId] ?? TOKENS[toTokenId];

  // The active balance token shown at the top
  const [activeBalanceTokenId, setActiveBalanceTokenId] = useState<string>(toTokenId);

  useEffect(() => {
    setActiveBalanceTokenId(toTokenId);
  }, [toTokenId]);

  const activeBalanceToken = tokenMap[activeBalanceTokenId] ?? TOKENS[activeBalanceTokenId];

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
    setToAmount(calculateAmmConversion(numVal, fromTokenId, toTokenId));
  };

  const handleToAmountChange = (val: string) => {
    setToAmount(val);
    setActivePercentage(null);

    const numVal = parseAmount(val);
    setFromAmount(calculateAmmConversionInverse(numVal, fromTokenId, toTokenId));
  };

  const handlePercentage = (percentage: number) => {
    setActivePercentage(percentage);
    const calculatedAmountNum = (fromToken.balance * percentage) / 100;
    const calculatedAmountStr = calculatedAmountNum.toFixed(2);

    setFromAmount(formatAmount(calculatedAmountStr));
    setToAmount(calculateAmmConversion(calculatedAmountNum, fromTokenId, toTokenId));
  };

  const [status, setStatus] = useState<'form' | 'error' | 'success' | 'processing'>('form');

  const { isConnected, publicKey, signTransaction } = useWalletStore();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSwapSubmit = async () => {
    if (!isConnected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setStatus('processing');
      setErrorMessage('');

      const toAmountNum = parseAmount(toAmount);
      const minAmountOutNum = toAmountNum * 0.95; // 5% slippage tolerance

      const txXdr = await buildSwapTx(
        publicKey,
        fromTokenId as 'XLM' | 'RPK',
        fromAmount,
        minAmountOutNum.toString()
      );

      const signedXdr = await signTransaction(txXdr, 'testnet');
      await submitTransaction(signedXdr);

      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }, 3000);

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Swap failed';
      if (msg.includes('InvalidAction') || msg.includes('UnreachableCodeReached')) {
        msg = "Swap failed due to high price impact (Slippage tolerance exceeded). The pool liquidity is too small for this swap size.";
      }
      setErrorMessage(msg);
      setStatus('error');
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
    errorMessage,
    handleSwapDirection,
    handleFromAmountChange,
    handleToAmountChange,
    handlePercentage,
    toggleActiveBalanceToken,
    getFiatEquivalent,
    handleSwapSubmit,
  };
}
