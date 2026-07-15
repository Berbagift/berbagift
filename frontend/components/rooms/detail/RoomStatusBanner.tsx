import React from 'react';

interface RoomStatusBannerProps {
  status: string;
}

export function RoomStatusBanner({ status }: RoomStatusBannerProps) {
  const s = status?.toLowerCase();

  if (s === 'waiting' || s === 'upcoming') {
    return (
      <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-secondary-500 dark:text-secondary-300 p-2.5 rounded-lg w-full">
        <i className="fi fi-rr-info text-lg flex-shrink-0" />
        <span className="text-base font-medium">Get ready!!! the claim session will begin soon</span>
      </div>
    );
  }

  if (s === 'claim_open' || s === 'active') {
    return (
      <div className="flex items-center gap-2 bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-300 p-2.5 rounded-lg w-full">
        <i className="fi fi-rr-unlock text-lg flex-shrink-0" />
        <span className="text-base font-medium">Claim is now open! Hurry up before it runs out.</span>
      </div>
    );
  }

  if (s === 'completed') {
    return (
      <div className="flex items-center gap-2 bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-300 p-2.5 rounded-lg w-full">
        <i className="fi fi-rr-unlock text-lg flex-shrink-0" />
        <span className="text-base font-medium">The draw is complete! Claim your rewards now.</span>
      </div>
    );
  }

  if (s === 'ended' || s === 'cancelled') {
    return (
      <div className="flex items-center gap-2 bg-neutral-3 dark:bg-neutral-10 text-neutral-8 dark:text-neutral-4 p-2.5 rounded-lg w-full">
        <i className="fi fi-rr-lock text-lg flex-shrink-0" />
        <span className="text-base font-medium">This room has ended and no longer accepts claims.</span>
      </div>
    );
  }

  return null;
}
