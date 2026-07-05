import React from 'react';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { RecipientChip } from '@/components/shared/recipient-chip';
import { cn } from '@/lib/utils';

export function SummaryCards() {
  const state = useSendThrStore();

  const firstRecipient = state.recipients[0];
  const secondRecipient = state.recipients[1];
  const additionalRecipientsCount = state.recipients.length > 2 ? state.recipients.length - 2 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Recipient Card */}
      <div className="border border-border rounded-lg p-5 bg-white dark:bg-neutral-900/40 flex flex-col justify-between h-40">
        <span className="text-base font-medium text-black dark:text-neutral-1">Recipient</span>
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          {firstRecipient && (
            <RecipientChip
              initials={firstRecipient.initials}
              username={firstRecipient.username}
              onRemove={undefined}
            />
          )}
          {secondRecipient && (
            <RecipientChip
              initials={secondRecipient.initials}
              username={secondRecipient.username}
              onRemove={undefined}
            />
          )}
          {additionalRecipientsCount > 0 && (
            <div className="h-9 px-3 rounded-full border border-border bg-[#FCFCFC] dark:bg-neutral-10 flex items-center justify-center text-sm font-medium text-black dark:text-neutral-1">
              +{additionalRecipientsCount}
            </div>
          )}
          {!firstRecipient && (
            <span className="text-sm text-neutral-6">No recipients</span>
          )}
        </div>
      </div>

      {/* Amount Card */}
      <div className="border border-border rounded-lg p-5 bg-white dark:bg-neutral-900/40 flex flex-col h-40">
        <span className="text-base font-medium text-black dark:text-neutral-1 self-start">Amount</span>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[24px] font-semibold text-black dark:text-neutral-1 tracking-tight leading-none">
            {state.amount || '0'} {state.activeToken.symbol}
          </span>
        </div>
      </div>

      {/* Message Card */}
      <div className="border border-border rounded-lg p-5 bg-white dark:bg-neutral-900/40 flex flex-col h-40">
        <span className="text-base font-medium text-black dark:text-neutral-1 self-start">Message</span>
        <div className="flex-1 flex items-center justify-center">
          <p className={cn(
            "text-base font-medium text-center line-clamp-2 leading-relaxed",
            state.message ? "text-black dark:text-neutral-1" : "text-neutral-8 dark:text-neutral-4"
          )}>
            {state.message || 'No message'}
          </p>
        </div>
      </div>
    </div>
  );
}
