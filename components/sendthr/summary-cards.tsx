import React from 'react';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { RecipientChip } from '@/components/shared/recipient-chip';

export function SummaryCards() {
  const state = useSendThrStore();

  const primaryRecipient = state.recipients[0];
  const additionalRecipientsCount = state.recipients.length > 1 ? state.recipients.length - 1 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Recipient Card */}
      <div className="border border-neutral-5 rounded-md p-4 bg-white flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-8">Recipient</span>
        <div className="flex flex-wrap items-center gap-2">
          {primaryRecipient ? (
            <>
              <RecipientChip
                initials={primaryRecipient.initials}
                username={primaryRecipient.username}
                onRemove={undefined} // read-only in summary
              />
              {additionalRecipientsCount > 0 && (
                <div className="h-7 px-2 rounded-full border border-neutral-5 bg-neutral-2 flex items-center justify-center text-xs font-medium text-neutral-8">
                  +{additionalRecipientsCount}
                </div>
              )}
            </>
          ) : (
            <span className="text-sm text-neutral-6">No recipients</span>
          )}
        </div>
      </div>

      {/* Amount Card */}
      <div className="border border-neutral-5 rounded-md p-4 bg-white flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-8">Amount</span>
        <div className="flex items-center">
          <span className="text-xl font-semibold text-black">
            {state.amount || '0'} {state.activeToken.symbol}
          </span>
        </div>
      </div>

      {/* Message Card */}
      <div className="border border-neutral-5 rounded-md p-4 bg-white flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-8">Message</span>
        <div className="flex items-start flex-1">
          <p className="text-sm text-neutral-6 line-clamp-2">
            {state.message || 'No message'}
          </p>
        </div>
      </div>
    </div>
  );
}
