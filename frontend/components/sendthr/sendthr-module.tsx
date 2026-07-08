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

export function SendThrModule() {
  const router = useRouter();
  const state = useSendThrState();
  const { data: userProfile } = useUserProfile();
  const [recipientInput, setRecipientInput] = React.useState('');

  const activeSymbol = state.activeToken.id; // 'XLM' or 'USDC'
  const realBalance = userProfile?.balances?.[activeSymbol] || "0.00";
  
  // Format the IDR dynamically. The API returns a number or string number for IDR.
  const rawIdr = userProfile?.balances_idr?.[activeSymbol] || 0;
  const realIdrStr = Number(rawIdr).toLocaleString('id-ID');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pendingInput = recipientInput.trim();
    
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
    
    // Check balance before proceeding
    if (parseFloat(state.amount) > parseFloat(realBalance)) {
      alert(`Insufficient ${activeSymbol} balance`);
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
        equivalentIdr={realIdrStr}
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
                  const val = recipientInput.trim();
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
        <TokenAmountField
          label="Amount"
          token={state.activeToken}
          amount={state.amount}
          onAmountChange={state.handleAmountChange}
          equivalentFiat={state.getFiatEquivalent(state.amount)}
          showDropdown={true}
          availableTokens={Object.values(TOKENS)}
          onTokenSelect={(id) => state.setTokenId(id)}
          size="lg"
        />

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

        {/* Platform Fee Badge */}
        <FeeBadge feeText="0.5% Platform fee" className="mt-2 mb-1" />

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
