import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface NFTCardProps {
  nft: any;
  onBuy?: (id: string, price: string) => void;
  isBuying?: boolean;
}

function resolveUri(uri: string) {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  return uri;
}

export function NFTCard({ nft, onBuy, isBuying = false }: NFTCardProps) {
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

  const displayImage = imageError ? '' : resolvedImage;
  const title = metadataTitle || 'Gift NFT';

  return (
    <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative w-full aspect-[436/624] bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden rounded-t-xl">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`NFT #${nft.token_id}`}
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
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 block">
              Item #{nft.token_id}
            </span>
            <Tooltip content={title}>
              <h3 className="text-lg font-bold text-black dark:text-neutral-1 truncate max-w-[180px] cursor-default">
                {title}
              </h3>
            </Tooltip>
          </div>

          <div className="text-right shrink-0 ml-2">
            <span className="text-xs text-neutral-500 block mb-1">Price</span>
            <span className="text-base font-bold text-black dark:text-neutral-1 whitespace-nowrap">
              {nft.price || '- XLM'}
            </span>
          </div>
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 mb-4 bg-neutral-50 dark:bg-neutral-900 rounded-md p-2 border border-neutral-100 dark:border-neutral-800">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs font-medium text-emerald-700 dark:text-emerald-300 shrink-0">
            {nft.owner_username ? nft.owner_username.substring(1, 3).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] text-neutral-500">Seller</span>
            <span className="text-xs font-medium truncate">{nft.owner_username || 'Unknown'}</span>
          </div>
        </div>

        {nft.message && !nft.is_purchased && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 flex-1 italic">
            &ldquo;{nft.message}&rdquo;
          </p>
        )}

        {nft.is_purchased && (
          <div className="flex items-center gap-2 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2 border border-amber-100 dark:border-amber-800">
            <i className="fi fi-rr-shopping-cart text-xs text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-300">Purchased</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-10 cursor-pointer"
            onClick={() => onBuy?.(nft.token_id, nft.price)}
            disabled={isBuying}
          >
            {isBuying ? (
              <span className="flex items-center gap-2">
                <i className="fi fi-rr-spinner animate-spin" /> Buying...
              </span>
            ) : (
              'Buy Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
