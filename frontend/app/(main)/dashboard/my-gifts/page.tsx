'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useNfts } from '@/lib/api/queries/nfts';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { ListGiftModal } from './list-gift-modal';
import { buildCancelListingTx } from '@/lib/stellar/marketplace';
import { submitTransaction } from '@/lib/stellar/transactions';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

function resolveUri(uri: string) {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
}

function GiftCard({ nft, onListClick, onUnlistClick, isUnlisting }: { nft: any; onListClick: (tokenId: number) => void; onUnlistClick: (tokenId: number) => void; isUnlisting: boolean }) {
  const rawUri = nft.token_uri || '';
  const [resolvedImage, setResolvedImage] = useState('');
  const [metadataTitle, setMetadataTitle] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!rawUri) return;
    const metadataUrl = resolveUri(rawUri);

    fetch(metadataUrl)
      .then((r) => r.json())
      .then((meta) => {
        const img = meta.image || meta.image_url || '';
        if (img) setResolvedImage(resolveUri(img));
        if (meta.name) setMetadataTitle(meta.name);
      })
      .catch(() => {
        setResolvedImage(metadataUrl);
      });
  }, [rawUri]);

  const isListed = nft.is_listed;

  const initials = nft.sender_username
    ? (nft.sender_username.startsWith('@')
        ? nft.sender_username.substring(1, 3).toUpperCase()
        : nft.sender_username.substring(0, 2).toUpperCase())
    : '?';

  const displayImage = imageError ? '' : resolvedImage;

  const title = metadataTitle || 'Gift NFT';

  return (
    <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative w-full aspect-[436/624] bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden rounded-t-xl">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`Gift #${nft.token_id}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fi fi-rr-gift text-5xl text-emerald-300 dark:text-emerald-700" />
          </div>
        )}
        {isListed && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Listed
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 block">
              Gift #{nft.token_id}
            </span>
            <Tooltip content={title}>
              <h3 className="text-lg font-bold text-black dark:text-neutral-1 truncate max-w-[180px] cursor-default">
                {title}
              </h3>
            </Tooltip>
          </div>
        </div>

        {nft.sender_username && !nft.is_purchased && (
          <div className="flex items-center gap-2 mb-4 bg-neutral-50 dark:bg-neutral-900 rounded-md p-2 border border-neutral-100 dark:border-neutral-800">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs font-medium text-emerald-700 dark:text-emerald-300 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-neutral-500">From</span>
              <span className="text-xs font-medium truncate">{nft.sender_username}</span>
            </div>
          </div>
        )}

        {nft.is_purchased && (
          <div className="flex items-center gap-2 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2 border border-amber-100 dark:border-amber-800">
            <i className="fi fi-rr-shopping-cart text-xs text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-300">Purchased</span>
          </div>
        )}

        {nft.message && !nft.is_purchased && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 flex-1 italic">
            &ldquo;{nft.message}&rdquo;
          </p>
        )}

        {/* Actions */}
        {isListed && nft.price ? (
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-center text-sm text-neutral-6 mb-2">
              Listed for <span className="font-semibold text-black dark:text-neutral-1">{nft.price}</span>
            </p>
            <Button
              variant="outline"
              className="w-full border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold h-10 cursor-pointer"
              onClick={() => onUnlistClick(nft.token_id)}
              disabled={isUnlisting}
            >
              {isUnlisting ? (
                <span className="flex items-center gap-2">
                  <i className="fi fi-rr-spinner animate-spin" /> Unlisting...
                </span>
              ) : (
                'Unlist'
              )}
            </Button>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-10 cursor-pointer"
              onClick={() => onListClick(nft.token_id)}
            >
              List on Marketplace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyGiftsPage() {
  const { publicKey, isConnected, signTransaction } = useWalletStore();
  const { data: nfts = [], isLoading } = useNfts();
  const [listingTokenId, setListingTokenId] = useState<number | null>(null);
  const [unlistingTokenId, setUnlistingTokenId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const handleListedSuccess = () => {
    toast.success('Gift listed on marketplace!');
    setListingTokenId(null);
    // Immediate invalidation for instant UI feedback
    queryClient.invalidateQueries({ queryKey: ['nfts', publicKey] });
    queryClient.invalidateQueries({ queryKey: ['marketplace_nfts'] });
  };

  const handleUnlist = async (tokenId: number) => {
    if (!publicKey) {
      toast.error('Wallet not connected');
      return;
    }
    setUnlistingTokenId(tokenId);
    try {
      const txXdr = await buildCancelListingTx(publicKey, tokenId);
      const signedXdr = await signTransaction(txXdr, 'testnet');
      await submitTransaction(signedXdr);

      toast.success(`Gift #${tokenId} unlisted from marketplace`);
      queryClient.invalidateQueries({ queryKey: ['nfts', publicKey] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_nfts'] });
    } catch (err: any) {
      console.error('Unlist failed:', err);
      toast.error(err.message || 'Failed to unlist. Please try again.');
    } finally {
      setUnlistingTokenId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <i className="fi fi-rr-wallet text-4xl text-neutral-4 mb-4" />
        <h3 className="text-lg font-semibold text-black dark:text-neutral-1 mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-neutral-6 max-w-md">
          Please connect your Freighter wallet to view your gift collection.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white dark:bg-card h-[400px] animate-pulse overflow-hidden">
            <div className="w-full aspect-square bg-neutral-2 dark:bg-neutral-9" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/3 bg-neutral-2 dark:bg-neutral-9 rounded" />
              <div className="h-6 w-2/3 bg-neutral-2 dark:bg-neutral-9 rounded" />
              <div className="h-10 w-full bg-neutral-2 dark:bg-neutral-9 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <i className="fi fi-rr-box-open text-4xl text-neutral-4 mb-4" />
        <h3 className="text-lg font-semibold text-black dark:text-neutral-1 mb-2">No Gifts Yet</h3>
        <p className="text-sm text-neutral-6 max-w-md">
          You haven't received any NFT gifts yet. When someone sends you a gift, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium text-black dark:text-neutral-1">My Gifts</h1>
        <p className="text-lg text-neutral-6 dark:text-neutral-4">
          Your NFT gift collection. List them on the marketplace to sell.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {nfts.map((nft: any) => (
          <GiftCard
            key={nft.token_id}
            nft={nft}
            onListClick={(tokenId) => setListingTokenId(tokenId)}
            onUnlistClick={(tokenId) => handleUnlist(tokenId)}
            isUnlisting={unlistingTokenId === nft.token_id}
          />
        ))}
      </div>

      {listingTokenId != null && (
        <ListGiftModal
          tokenId={listingTokenId}
          isOpen={listingTokenId != null}
          onClose={() => setListingTokenId(null)}
          onSuccess={handleListedSuccess}
        />
      )}
    </div>
  );
}
