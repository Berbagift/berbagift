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
    <div className="flex flex-col sm:flex-row gap-5 w-full">
      <button
        onClick={onClaim}
        disabled={isClaimDisabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl transition-colors ${isClaimDisabled
          ? 'bg-neutral-6 text-white cursor-not-allowed dark:bg-neutral-9 dark:text-neutral-5'
          : 'bg-secondary-500 text-white hover:bg-secondary-600'
          }`}
      >
        Claim Rewards
        <i className="fi fi-rr-gift text-xl mt-0.5" />
      </button>

      <button
        onClick={onLeave}
        className="flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl text-secondary-500 bg-white dark:bg-card border border-secondary-500 dark:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-950/30 transition-colors"
      >
        Leave Room
        <i className="fi fi-rr-sign-out-alt text-xl mt-0.5" />
      </button>
    </div>
  );
}
