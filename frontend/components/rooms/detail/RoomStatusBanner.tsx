import React from 'react';

interface RoomStatusBannerProps {
  status: string;
}

export function RoomStatusBanner({ status }: RoomStatusBannerProps) {
  if (status === 'waiting') {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-md w-full border border-emerald-100">
        <i className="fi fi-rr-info text-sm mt-0.5" />
        <span className="text-sm font-semibold">Get ready!!! the claim session will begin soon</span>
      </div>
    );
  }

  if (status === 'claim_open') {
    return (
      <div className="flex items-center gap-2 bg-secondary-50 text-secondary-600 px-4 py-1.5 rounded-md w-full border border-secondary-100">
        <i className="fi fi-rr-unlock text-sm mt-0.5" />
        <span className="text-sm font-semibold">Claim is now open! Hurry up before it runs out.</span>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="flex items-center gap-2 bg-neutral-3 text-neutral-8 dark:text-neutral-6 px-4 py-1.5 rounded-md w-full border border-neutral-4 dark:border-border">
        <i className="fi fi-rr-lock text-sm mt-0.5" />
        <span className="text-sm font-semibold">This room has ended and no longer accepts claims.</span>
      </div>
    );
  }

  return null;
}
