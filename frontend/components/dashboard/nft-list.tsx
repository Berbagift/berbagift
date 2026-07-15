"use client";

import React from 'react';
import { useNfts } from '@/lib/api/queries';
import { StatusState } from '@/components/shared/status-state';
import Image from 'next/image';

function formatIpfsUrl(url: string) {
  if (url.startsWith('ipfs://')) {
    // using pinata gateway for faster resolving
    return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return url;
}

export function NftList() {
  const { data: nfts = [], isLoading } = useNfts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-card border border-border p-4 space-y-4">
            <div className="w-full aspect-square bg-emerald-100/80 dark:bg-emerald-800/30 rounded-lg"></div>
            <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-3/4"></div>
            <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <StatusState
        icon="fi-rr-box-open"
        title="No Gifts Found"
        description="You have not received any gifts yet."
        iconColorClass="text-neutral-400 dark:text-neutral-600"
        bgColorClass="bg-neutral-50 dark:bg-neutral-900/30"
        className="py-16"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft: any) => (
        <div
          key={nft.token_id}
          className="relative flex flex-col bg-white dark:bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Image Container */}
          <div className="relative w-full aspect-[436/624] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-border">
            <img
              src={formatIpfsUrl(nft.token_uri)}
              alt={`NFT #${nft.token_id}`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/thumbnail/thumb_envelope1.webp"; // fallback
              }}
              loading="lazy"
            />
            {/* Overlay Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
              <div className="text-[#16a34a] mb-2 flex items-center justify-center">
                <i className="fi fi-rr-gift text-[32px] leading-none"></i>
              </div>

              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-[14px] font-normal text-black leading-none">From</span>
                <h3 className="text-[20px] font-semibold text-black leading-tight tracking-tight max-w-[180px] truncate">
                  {nft.sender_username || `${nft.sender_address.slice(0, 4)}...${nft.sender_address.slice(-4)}`}
                </h3>
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 mt-4">
                <span className="text-[14px] font-medium text-black leading-none">
                  You&apos;re Receiving
                </span>
                <div className="text-[22px] font-semibold text-[#16a34a] leading-none tracking-tight">
                  {nft.token_amount}
                </div>
              </div>
            </div>
            {/* Overlay Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
              #{nft.token_id}
            </div>

            <div className="absolute bottom-3 right-3 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-md">
              {nft.token_amount}
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
                {nft.sender_username || `${nft.sender_address.slice(0, 4)}...${nft.sender_address.slice(-4)}`}
              </span>
            </div>

            {nft.message && (
              <div className="mt-auto bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 italic line-clamp-2">
                  "{nft.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
