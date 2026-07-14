import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface NFTCardProps {
  nft: any;
  onBuy?: (id: string, price: string) => void;
}

export function NFTCard({ nft, onBuy }: NFTCardProps) {
  // Use ipfs gateway if needed, or fallback
  const imageUrl = nft.token_uri 
    ? nft.token_uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
    : '/gift.png'; // placeholder

  return (
    <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={`NFT #${nft.token_id}`} 
          fill 
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
          unoptimized
        />
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1 block">
              Item #{nft.token_id}
            </span>
            <h3 className="text-lg font-bold text-black dark:text-neutral-1 truncate max-w-[150px]">
              Gift NFT
            </h3>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-neutral-500 block mb-1">Price</span>
            <span className="text-base font-bold text-black dark:text-neutral-1 whitespace-nowrap">
              {nft.price || '- XLM'}
            </span>
          </div>
        </div>

        {/* Sender / Message */}
        <div className="flex items-center gap-2 mb-4 bg-neutral-50 dark:bg-neutral-900 rounded-md p-2 border border-neutral-100 dark:border-neutral-800">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs font-medium text-emerald-700 dark:text-emerald-300 shrink-0">
            {nft.owner_username ? nft.owner_username.substring(1, 3).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] text-neutral-500">Seller</span>
            <span className="text-xs font-medium truncate">{nft.owner_username || 'Unknown'}</span>
          </div>
        </div>
        
        {nft.message && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 flex-1 italic">
            "{nft.message}"
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-border">
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-10"
            onClick={() => onBuy?.(nft.token_id, nft.price)}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
