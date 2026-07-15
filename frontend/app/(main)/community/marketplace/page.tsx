'use client';

import { useState } from 'react';
import { useMarketplaceNfts } from '@/lib/api/queries/nfts';
import { NFTCard } from '@/components/marketplace/NFTCard';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { EmptyState } from '@/components/rooms/EmptyState';
import { Button } from '@/components/ui/button';
import { MintNFTModal } from '@/components/marketplace/mint-nft-modal';
import { toast } from 'react-toastify';

const NFTCardSkeleton = () => (
  <div className="flex flex-col bg-white dark:bg-card border border-border rounded-xl p-0 h-[400px] animate-pulse overflow-hidden">
    <div className="w-full aspect-square bg-emerald-50 dark:bg-emerald-950/20" />
    <div className="p-5 flex flex-col flex-1">
      <div className="h-4 w-1/3 bg-emerald-100/80 dark:bg-emerald-800/30 rounded mb-2" />
      <div className="h-6 w-2/3 bg-emerald-100/80 dark:bg-emerald-800/30 rounded mb-4" />
      <div className="h-10 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded mb-4" />
      <div className="mt-auto">
        <div className="h-10 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
      </div>
    </div>
  </div>
);

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const { data: nfts = [], isLoading } = useMarketplaceNfts();

  const filteredNfts = nfts.filter((nft) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      String(nft.token_id).includes(lowerQuery) ||
      (nft.owner_username && nft.owner_username.toLowerCase().includes(lowerQuery)) ||
      (nft.message && nft.message.toLowerCase().includes(lowerQuery))
    );
  });

  const handleBuy = (tokenId: string, price: string) => {
    // In the future, integrate smart contract call here
    toast.info(`Buying NFT #${tokenId} for ${price} - Coming Soon!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-6 bg-background sticky top-0 z-10 pt-4 pb-2">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="flex flex-col max-w-3xl xl:max-w-none">
            <h1 className="text-3xl font-medium text-black dark:text-neutral-1 mb-2">
              NFT Marketplace 🎨
            </h1>
            <p className="text-xl font-medium text-neutral-8 dark:text-neutral-4 xl:whitespace-nowrap">
              Discover and collect exclusive Gift NFTs from the community.
            </p>
          </div>
          <div className="flex-shrink-0 mt-1 flex items-center gap-3">
            <Button 
              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors"
              onClick={() => setIsMintModalOpen(true)}
            >
              <i className="fi fi-rr-magic-wand text-sm mr-2" />
              Mint NFT
            </Button>
            <RoomSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-6 bg-background pb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <NFTCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredNfts.map((nft) => (
              <NFTCard
                key={nft.token_id}
                nft={nft}
                onBuy={handleBuy}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              searchQuery
                ? `No NFTs found for "${searchQuery}"`
                : "No NFTs currently listed on the marketplace"
            }
          />
        )}
      </div>

      {/* Mint NFT Modal */}
      <MintNFTModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
      />
    </div>
  );
}
