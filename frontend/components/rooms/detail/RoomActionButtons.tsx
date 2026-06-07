import React from 'react';

interface RoomActionButtonsProps {
  status: string;
  onClaim: () => void;
  onLeave: () => void;
}

export function RoomActionButtons({ status, onClaim, onLeave }: RoomActionButtonsProps) {
  const isClaimDisabled = status !== 'claim_open';

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <button
        onClick={onClaim}
        disabled={isClaimDisabled}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-semibold text-[15px] transition-colors ${isClaimDisabled
          ? 'bg-neutral-3 text-neutral-6 cursor-not-allowed'
          : 'bg-secondary-500 text-white hover:bg-secondary-600'
          }`}
      >
        Claim Rewards
        <i className="fi fi-rr-gift text-lg mt-0.5" />
      </button>

      <button
        onClick={onLeave}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-semibold text-[15px] text-secondary-500 bg-white dark:bg-card border-2 border-secondary-100 hover:border-secondary-500 hover:bg-secondary-50 transition-colors"
      >
        Leave Room
        <i className="fi fi-rr-sign-out-alt text-lg mt-0.5" />
      </button>
    </div>
  );
}
