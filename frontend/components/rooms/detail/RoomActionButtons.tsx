import React from 'react';

interface RoomActionButtonsProps {
  status: string;
  onClaim: () => void;
  onLeave: () => void;
}

export function RoomActionButtons({ status, onClaim, onLeave }: RoomActionButtonsProps) {
  const s = status?.toLowerCase();
  const isClaimDisabled = s !== 'claim_open' && s !== 'active';

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <button
        onClick={onClaim}
        disabled={isClaimDisabled}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-[15px] min-h-[44px] transition-colors ${isClaimDisabled
          ? 'bg-neutral-3 text-neutral-6 cursor-not-allowed dark:bg-neutral-10 dark:text-neutral-5'
          : 'bg-secondary-500 text-white hover:bg-secondary-600'
          }`}
      >
        Claim Rewards
        <i className="fi fi-rr-gift text-lg mt-0.5" />
      </button>

      <button
        onClick={onLeave}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-[15px] min-h-[44px] text-secondary-500 bg-white dark:bg-card border-2 border-secondary-500 dark:border-secondary-500 hover:border-secondary-500 dark:hover:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-950/30 transition-colors"
      >
        Leave Room
        <i className="fi fi-rr-sign-out-alt text-lg mt-0.5" />
      </button>
    </div>
  );
}
