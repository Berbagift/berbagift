import React from 'react';
import { InboxMailItemData } from '../InboxMailItem';

interface SwapPreviewProps {
  details?: InboxMailItemData['details'];
}

export function SwapPreview({ details }: SwapPreviewProps) {
  return (
    <div className="bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-100/50 dark:border-indigo-950/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <i className="fi fi-rr-refresh text-lg" />
        </div>
        <div>
          <span className="text-[10px] md:text-xs text-neutral-7 dark:text-neutral-6 uppercase tracking-wider font-semibold">Transaction Value</span>
          <h4 className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {details?.amount || 'N/A'}
          </h4>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-4/40 dark:border-neutral-10/40 grid grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Swap Type:</span>
          <p className="font-semibold text-black dark:text-neutral-1 mt-0.5">{details?.username || 'N/A'}</p>
        </div>
        {details?.txHash && (
          <div>
            <span className="text-neutral-7 dark:text-neutral-6">Tx Hash:</span>
            <p className="font-mono font-semibold text-indigo-500 hover:underline mt-0.5 truncate max-w-[120px]" title={details.txHash}>
              {details.txHash.substring(0, 8)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
