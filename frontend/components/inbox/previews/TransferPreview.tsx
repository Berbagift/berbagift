import React from 'react';
import { InboxMailItemData } from '../InboxMailItem';

interface TransferPreviewProps {
  details?: InboxMailItemData['details'];
}

export function TransferPreview({ details }: TransferPreviewProps) {
  return (
    <div className="bg-blue-50/10 dark:bg-blue-950/5 border border-blue-100/50 dark:border-blue-950/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
          <i className="fi fi-rr-paper-plane text-lg" />
        </div>
        <div>
          <span className="text-[10px] md:text-xs text-neutral-7 dark:text-neutral-6 uppercase tracking-wider font-semibold">Transaction Value</span>
          <h4 className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {details?.amount || 'N/A'}
          </h4>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-4/40 dark:border-neutral-10/40 grid grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Recipient/Sender:</span>
          <p className="font-semibold text-black dark:text-neutral-1 mt-0.5">{details?.username || 'N/A'}</p>
        </div>
        {details?.txHash && (
          <div>
            <span className="text-neutral-7 dark:text-neutral-6">Tx Hash:</span>
            <p className="font-mono font-semibold text-blue-500 hover:underline mt-0.5 truncate max-w-[120px]" title={details.txHash}>
              {details.txHash.substring(0, 8)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
