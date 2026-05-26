'use client';

import React from 'react';
import { useSendThrState } from '@/hooks/use-send-thr-state';
import { BalanceHeaderCard } from '@/components/finance/balance-header-card';
import { TokenAmountField } from '@/components/forms/token-amount-field';
import { RecipientChip } from '@/components/shared/recipient-chip';
import { FeeBadge } from '@/components/finance/fee-badge';
import { ActionSubmitButton } from '@/components/forms/action-submit-button';
import { SecurityNote } from '@/components/finance/security-note';
import { TOKENS } from '@/lib/data/tokens';

export function SendThrModule() {
  const state = useSendThrState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would trigger the wallet signature / transfer pipeline
    alert(`Transfer of ${state.amount} ${state.activeToken.symbol} initiated to ${state.recipients.length} recipients.`);
  };

  return (
    <div className="w-full max-w-[740px] mx-auto flex flex-col gap-5">
      {/* Top Balance Card */}
      <BalanceHeaderCard
        balance={state.activeToken.balance}
        symbol={state.activeToken.symbol}
        equivalentIdr={state.activeToken.equivalentIdr}
        onToggleToken={state.toggleToken}
      />

      {/* Main Send Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full border border-neutral-5 rounded-md p-6 bg-white flex flex-col gap-5 "
      >
        {/* Recipient Section */}
        <div className="flex flex-col gap-2">
          <label className="text-neutral-8 font-medium text-sm">Recipient</label>
          <div className="border border-neutral-5 rounded-md p-3 bg-white flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-neutral-8 transition-colors">
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
              placeholder={state.recipients.length === 0 ? "Type username and press Enter..." : "Add username..."}
              className="flex-grow bg-transparent border-none outline-none text-sm text-black placeholder:text-neutral-6 min-w-[150px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    state.addRecipient(val);
                    e.currentTarget.value = '';
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
            className="w-full border border-neutral-5 rounded-md p-3 bg-white outline-none focus:border-neutral-8 transition-colors text-sm text-black placeholder:text-neutral-6 resize-none font-sans"
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
