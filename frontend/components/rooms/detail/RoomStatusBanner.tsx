import React from 'react';

interface RoomStatusBannerProps {
  status: string;
}

export function RoomStatusBanner({ status }: RoomStatusBannerProps) {
  const s = status?.toLowerCase();

  if (s === 'waiting' || s === 'upcoming') {
    return (
      <div className="flex items-start sm:items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-100 px-3 py-2 sm:px-4 sm:py-1.5 rounded-md w-full border border-emerald-100 dark:border-emerald-900 leading-tight">
        <i className="fi fi-rr-info text-xs sm:text-sm mt-0.5 sm:mt-0 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium sm:font-semibold">Get ready!!! the claim session will begin soon</span>
      </div>
    );
  }

  if (s === 'claim_open' || s === 'active') {
    return (
      <div className="flex items-start sm:items-center gap-2 bg-secondary-50 dark:bg-secondary-950/30 text-secondary-600 dark:text-secondary-100 px-3 py-2 sm:px-4 sm:py-1.5 rounded-md w-full border border-secondary-100 dark:border-secondary-900 leading-tight">
        <i className="fi fi-rr-unlock text-xs sm:text-sm mt-0.5 sm:mt-0 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium sm:font-semibold">Claim is now open! Hurry up before it runs out.</span>
      </div>
    );
  }

  if (s === 'ended' || s === 'completed') {
    return (
      <div className="flex items-start sm:items-center gap-2 bg-neutral-3 dark:bg-neutral-10 text-neutral-8 dark:text-neutral-4 px-3 py-2 sm:px-4 sm:py-1.5 rounded-md w-full border border-border leading-tight">
        <i className="fi fi-rr-lock text-xs sm:text-sm mt-0.5 sm:mt-0 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium sm:font-semibold">This room has ended and no longer accepts claims.</span>
      </div>
    );
  }

  return null;
}
