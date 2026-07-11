'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSendThrState } from '@/hooks/use-send-thr-state';
import { BalanceHeaderCard } from '@/components/finance/balance-header-card';
import { TokenAmountField } from '@/components/forms/token-amount-field';
import { RecipientChip } from '@/components/shared/recipient-chip';
import { FeeBadge } from '@/components/finance/fee-badge';
import { ActionSubmitButton } from '@/components/forms/action-submit-button';
import { SecurityNote } from '@/components/finance/security-note';
import { TOKENS } from '@/lib/data/tokens';
import { useUserProfile } from '@/hooks/use-user-profile';

import { useCryptoPrices } from '@/lib/api/queries/prices';

export function SendThrModule() {
  const router = useRouter();
  const state = useSendThrState();
  const { data: userProfile } = useUserProfile();
  const { data: cryptoPrices } = useCryptoPrices();
  const [recipientInput, setRecipientInput] = React.useState('');

  const activeSymbol = state.activeToken.id; // 'XLM' or 'RPK'
  const realBalance = Number(userProfile?.balances?.[activeSymbol] ?? 0);
  
  // Format the IDR dynamically. The API returns a number or string number for IDR.
  const realIdr = Number(userProfile?.balances_idr?.[activeSymbol] ?? 0);

  const getDynamicFiatEquivalent = (amount: string, symbol: string) => {
    const numVal = parseFloat(amount.replace(',', '.'));
    if (isNaN(numVal) || numVal === 0) return 'Rp 0';
    
    const rate = symbol === 'XLM' 
      ? (cryptoPrices?.stellar?.idr ?? 1600) 
      : (cryptoPrices?.rpk?.idr ?? 1);
      
    const result = Math.round(numVal * rate);
    return `Rp ${result.toLocaleString('id-ID')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pendingInput = recipientInput.trim().replace(/^@/, '');
    
    if (state.recipients.length === 0 && !pendingInput) {
      alert('Please add at least one recipient');
      return;
    }
    
    if (pendingInput) {
      state.addRecipient(pendingInput);
      setRecipientInput('');
    }

    if (!state.amount || parseFloat(state.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const sendAmount = parseFloat(state.amount);
    const feeAmount = sendAmount * 0.005;
    const totalAmount = sendAmount + feeAmount;

    // Check balance before proceeding
    if (totalAmount > realBalance) {
      alert(`Insufficient ${activeSymbol} balance. You need ${totalAmount} ${activeSymbol} (including 0.5% platform fee).`);
      return;
    }

    router.push('/sendthr/envelope');
  };

  return (
    <div className="w-full max-w-[740px] mx-auto flex flex-col gap-5">
      {/* Top Balance Card */}
      <BalanceHeaderCard
        balance={realBalance}
        symbol={state.activeToken.symbol}
        equivalentIdr={realIdr}
        onToggleToken={state.toggleToken}
      />

      {/* Main Send Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full border border-border rounded-md p-4 sm:p-5 md:p-6 bg-white dark:bg-card flex flex-col gap-4 sm:gap-5 "
      >
        {/* Recipient Section */}
        <div className="flex flex-col gap-2">
          <label className="text-neutral-8 font-medium text-sm">Recipient</label>
          <div className="border border-border rounded-md p-3 bg-white dark:bg-card flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-neutral-8 transition-colors">
            {state.recipients.map((rec) => (
              <RecipientChip
                key={rec.id}
                initials={rec.initials}
                username={rec.username}
                onRemove={() => state.removeRecipient(rec.id)}
              />
            ))}
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder={state.recipients.length === 0 ? "Type username and press Enter..." : "Add username..."}
              className="flex-grow bg-transparent border-none outline-none text-sm text-black dark:text-neutral-1 placeholder:text-neutral-6 min-w-[100px] sm:min-w-[150px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = recipientInput.trim().replace(/^@/, '');
                  if (val) {
                    state.addRecipient(val);
                    setRecipientInput('');
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Amount Section */}
        <div className="flex flex-col gap-1">
          <TokenAmountField
            label="Amount"
            token={state.activeToken}
            amount={state.amount}
            onAmountChange={state.handleAmountChange}
            equivalentFiat={getDynamicFiatEquivalent(state.amount, activeSymbol)}
            showDropdown={true}
            availableTokens={Object.values(TOKENS)}
            onTokenSelect={(id) => state.setTokenId(id)}
            size="lg"
          />
          {state.amount && parseFloat(state.amount) > 0 && (
            <p className="text-xs text-neutral-6 px-1">
              + 0.5% platform fee: <span className="font-medium text-neutral-8">{parseFloat(state.amount) * 0.005} {activeSymbol}</span>
            </p>
          )}
        </div>

        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <label className="text-neutral-8 font-medium text-sm">NFT Title</label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => state.handleTitleChange(e.target.value)}
            placeholder="e.g. Happy Eid Mubarak!"
            className="w-full border border-border rounded-md p-3 bg-white dark:bg-card outline-none focus:border-neutral-8 transition-colors text-sm text-black dark:text-neutral-1 placeholder:text-neutral-6 font-sans"
          />
        </div>

        {/* Message Section */}
        <div className="flex flex-col gap-2">
          <label className="text-neutral-8 font-medium text-sm">Message (Optional)</label>
          <textarea
            value={state.message}
            onChange={(e) => state.handleMessageChange(e.target.value)}
            placeholder="Type your message here..."
            rows={2}
            className="w-full border border-border rounded-md p-3 bg-white dark:bg-card outline-none focus:border-neutral-8 transition-colors text-sm text-black dark:text-neutral-1 placeholder:text-neutral-6 resize-none font-sans"
          />
        </div>

        {/* Platform Fee Badge Removed since smart contract has no fee */}
        <FeeBadge feeText="0.5% Platform Fee" className="mt-2 mb-1" />

        {/* Continue Button */}
        <ActionSubmitButton icon="fi-rr-arrow-small-right">
          Continue
        </ActionSubmitButton>

        {/* Security Note */}
        <SecurityNote text="Transfer mechanism using secure blockchain protocol" className="mt-2" />
      </form>
    </div>
  );
}
