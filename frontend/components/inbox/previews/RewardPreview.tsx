import React from 'react';
import { useRouter } from 'next/navigation';
import { InboxMailItemData } from '../InboxMailItem';

interface RewardPreviewProps {
  details?: InboxMailItemData['details'];
}

export function RewardPreview({ details }: RewardPreviewProps) {
  const router = useRouter();

  return (
    <div className="bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-950/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <i className="fi fi-rr-gift text-lg" />
        </div>
        <div>
          <span className="text-[10px] md:text-xs text-neutral-7 dark:text-neutral-6 uppercase tracking-wider font-semibold">Reward Amount</span>
          <h4 className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {details?.amount || 'N/A'}
          </h4>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-4/40 dark:border-neutral-10/40 grid grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Source Room:</span>
          {details?.roomId != null ? (
            <p className="font-semibold mt-0.5">
              <button
                onClick={() => router.push(`/community/explore/join/${details.roomId}`)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Room #{details.roomId}
              </button>
            </p>
          ) : (
            <p className="font-semibold text-black dark:text-neutral-1 mt-0.5">N/A</p>
          )}
        </div>
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Status:</span>
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Claimed</p>
        </div>
      </div>
    </div>
  );
}
