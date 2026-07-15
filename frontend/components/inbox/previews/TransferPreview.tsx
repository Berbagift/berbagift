import React from 'react';
import { InboxMailItemData } from '../InboxMailItem';

interface TransferPreviewProps {
  details?: InboxMailItemData['details'];
  title?: string;
}

export function TransferPreview({ details, title }: TransferPreviewProps) {
  if (title === 'Transfer received') {
    return (
      <div className="flex justify-center mt-6">
        <div className="relative flex flex-col bg-white dark:bg-card border border-border rounded-xl overflow-hidden max-w-sm w-full">
          {/* Image Container */}
          <div className="relative w-full aspect-[436/624] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-border">
            <img
              src="/thumbnail/thumb_envelope1.webp"
              alt={`BagiTHR NFT`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
              <div className="text-[#16a34a] mb-2 flex items-center justify-center">
                <i className="fi fi-rr-gift text-[32px] leading-none"></i>
              </div>

              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-[14px] font-normal text-black leading-none">From</span>
                <h3 className="text-[20px] font-semibold text-black leading-tight tracking-tight max-w-[180px] truncate">
                  {details?.username || 'Unknown'}
                </h3>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 mt-4">
                <span className="text-[14px] font-medium text-black leading-none">
                  You're Receiving
                </span>
                <div className="text-[22px] font-semibold text-[#16a34a] leading-none tracking-tight">
                  {details?.amount || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-md">
              {details?.amount || 'N/A'}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-black dark:text-neutral-1 mb-1 line-clamp-1">
              BagiTHR NFT
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">From:</span>
              <span className="text-sm font-medium text-black dark:text-neutral-2 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md truncate">
                {details?.username || 'Unknown'}
              </span>
            </div>

            {details?.message && (
              <div className="mt-auto bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 italic line-clamp-2">
                  "{details.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
