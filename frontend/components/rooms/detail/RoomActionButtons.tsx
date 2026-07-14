import React from 'react';

interface RoomActionButtonsProps {
  status: string;
  onClaim: () => void;
  onLeave: () => void;
  onJoin?: () => void;
  isJoining?: boolean;
  isClaiming?: boolean;
  isLeaving?: boolean;
  isSessionStarted?: boolean;
  isOwner?: boolean;
}

export function RoomActionButtons({ status, onClaim, onLeave, onJoin, isJoining, isClaiming, isLeaving, isSessionStarted = true, isOwner = false }: RoomActionButtonsProps) {
  const s = status?.toLowerCase();
  const isClaimDisabled = isOwner || isClaiming || (s !== 'claim_open' && s !== 'active' && s !== 'completed');
  const isJoinDisabled = isJoining || !isSessionStarted;

  return (
    <div className="flex flex-col sm:flex-row gap-5 w-full">
      {onJoin ? (
        <button
          onClick={onJoin}
          disabled={isJoinDisabled}
          className={`flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl transition-colors ${
            isJoinDisabled
              ? 'bg-neutral-6 text-white cursor-not-allowed dark:bg-neutral-9 dark:text-neutral-5'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isJoining ? 'Joining...' : !isSessionStarted ? 'Session Not Started' : 'Join Room'}
          {!isJoining && <i className="fi fi-rr-enter text-xl mt-0.5" />}
        </button>
      ) : (
        <>
          <button
            onClick={onClaim}
            disabled={isClaimDisabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl transition-colors ${isClaimDisabled
              ? 'bg-neutral-6 text-white cursor-not-allowed dark:bg-neutral-9 dark:text-neutral-5'
              : 'bg-secondary-500 text-white hover:bg-secondary-600'
              }`}
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
            {!isClaiming && <i className="fi fi-rr-gift text-xl mt-0.5" />}
          </button>

          <button
            onClick={onLeave}
            disabled={isOwner || isLeaving || s === 'completed'}
            className={`flex-1 flex items-center justify-center gap-2 px-4 h-14 rounded-lg font-medium text-xl transition-colors ${(isOwner || isLeaving || s === 'completed') ? 'bg-neutral-6 text-white cursor-not-allowed dark:bg-neutral-9 dark:text-neutral-5 border-none' : 'text-secondary-500 bg-white dark:bg-card border border-secondary-500 dark:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-950/30'}`}
          >
            {isLeaving ? 'Leaving...' : s === 'completed' ? 'Room Completed' : 'Leave Room'}
            {!isLeaving && <i className="fi fi-rr-sign-out-alt text-xl mt-0.5" />}
          </button>
        </>
      )}
    </div>
  );
}
