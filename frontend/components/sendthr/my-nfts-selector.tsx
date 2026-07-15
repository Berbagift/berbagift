'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useNfts } from '@/lib/api/queries/nfts';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { useSendThrStore } from '@/hooks/use-send-thr-state';
import { cn } from '@/lib/utils';

function resolveUri(uri: string) {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
}

interface NftData {
  token_id: number;
  token_uri: string;
  is_listed?: boolean;
  price?: string;
  sender_username?: string;
  message?: string;
  owner_address?: string;
}

interface NftCardProps {
  nft: NftData;
  isSelected: boolean;
  onSelect: (tokenId: number, imageUrl: string) => void;
}

function NftCard({ nft, isSelected, onSelect }: NftCardProps) {
  const rawUri = nft.token_uri || '';
  const [resolvedImage, setResolvedImage] = useState('');
  const [imageError, setImageError] = useState(false);
  const isListed = !!nft.is_listed;

  useEffect(() => {
    if (!rawUri) return;
    const metadataUrl = resolveUri(rawUri);

    fetch(metadataUrl)
      .then((r) => r.json())
      .then((meta) => {
        const img = meta.image || meta.image_url || '';
        if (img) setResolvedImage(resolveUri(img));
      })
      .catch(() => {
        // Silently fail — fallback placeholder will show
      });
  }, [rawUri]);

  const handleClick = () => {
    if (isListed) return; // Listed NFTs cannot be used
    if (resolvedImage) {
      onSelect(nft.token_id, resolvedImage);
    }
  };

  const displayImage = resolvedImage && !imageError;

  return (
    <button
      onClick={handleClick}
      disabled={isListed}
      className={cn(
        'relative flex flex-col items-start gap-3 p-3 rounded-md border text-left transition-all overflow-hidden',
        isListed
          ? 'border-border opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900'
          : isSelected
            ? 'border-[#16a34a] bg-[#16a34a]/5'
            : 'border-border hover:border-neutral-8 bg-white dark:bg-card'
      )}
    >
      <div className="relative w-full aspect-[436/624] rounded overflow-hidden bg-neutral-2">
        {displayImage ? (
          <Image
            src={resolvedImage}
            alt={`NFT #${nft.token_id}`}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fi fi-rr-gift text-4xl text-emerald-300/60 dark:text-emerald-700/60" />
          </div>
        )}
        {isListed && (
          <span className="absolute top-2 right-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
            Listed
          </span>
        )}
        {isSelected && !isListed && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[#16a34a] rounded-full flex items-center justify-center text-white shadow-sm z-10">
            <i className="fi fi-rr-check text-xs mt-0.5"></i>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-black dark:text-neutral-1 px-1">
        Gift #{nft.token_id}
      </span>
    </button>
  );
}

export function MyNftsSelector() {
  const { publicKey, isConnected } = useWalletStore();
  const { data: nfts = [], isLoading } = useNfts();
  const selectedNftTokenId = useSendThrStore((state) => state.selectedNftTokenId);
  const setSelectedNft = useSendThrStore((state) => state.setSelectedNft);

  // Wallet not connected
  if (!isConnected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <i className="fi fi-rr-wallet text-3xl text-neutral-4 mb-3" />
        <h3 className="text-base font-semibold text-black dark:text-neutral-1 mb-1">
          Connect Your Wallet
        </h3>
        <p className="text-sm text-neutral-6 max-w-md">
          Please connect your Freighter wallet to browse your NFT collection.
        </p>
      </div>
    );
  }

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border bg-white dark:bg-card p-3 space-y-3"
          >
            <div className="w-full aspect-[436/624] bg-neutral-2 dark:bg-neutral-800 rounded" />
            <div className="h-4 bg-neutral-2 dark:bg-neutral-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <i className="fi fi-rr-box-open text-3xl text-neutral-4 mb-3" />
        <h3 className="text-base font-semibold text-black dark:text-neutral-1 mb-1">
          No NFTs Found
        </h3>
        <p className="text-sm text-neutral-6 max-w-md">
          You don&apos;t have any NFT gifts yet. Receive a gift to use it as your envelope
          design.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {nfts.map((nft: NftData) => (
        <NftCard
          key={nft.token_id}
          nft={nft}
          isSelected={selectedNftTokenId === nft.token_id}
          onSelect={setSelectedNft}
        />
      ))}
    </div>
  );
}
