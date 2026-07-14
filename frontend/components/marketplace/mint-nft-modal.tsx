'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MintNFTModal({ isOpen, onClose }: MintNFTModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const closeModal = () => {
    setImageUrl('');
    setPrice('');
    setIsMinting(false);
    onClose();
  };

  const handleMint = async () => {
    if (!imageUrl || !price) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsMinting(true);
    try {
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Successfully minted Berbagift NFT and listed for ${price} XLM!`);
      closeModal();
    } catch (e) {
      alert("Minting failed");
      setIsMinting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mint-nft-title"
        className="max-h-[calc(100vh-64px)] w-full max-w-[500px] overflow-y-auto rounded-xl border border-border bg-white dark:bg-card p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] md:p-8"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="mint-nft-title" className="text-2xl font-bold text-black dark:text-neutral-1">
              Mint New NFT 🎨
            </h2>
            <p className="text-sm font-medium text-neutral-8 dark:text-neutral-4">
              Create and list your custom NFT directly on the marketplace.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-black dark:text-neutral-1">
                Upload Image <span className="text-red-500">*</span>
              </label>
              
              <div className="relative flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-border hover:border-emerald-500 dark:hover:border-emerald-400 bg-neutral-50 dark:bg-neutral-900 rounded-md transition-colors cursor-pointer overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setImageUrl(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain absolute inset-0 p-2" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <i className="fi fi-rr-picture text-lg mt-1" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black dark:text-neutral-2">Click or drag image to upload</p>
                      <p className="text-xs text-neutral-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nft-price" className="text-sm font-semibold text-black dark:text-neutral-1">
                Listing Price (XLM) <span className="text-red-500">*</span>
              </label>
              <Input
                id="nft-price"
                type="number"
                placeholder="e.g. 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="h-12 text-sm font-semibold border-border hover:bg-neutral-5 dark:hover:bg-neutral-10"
              disabled={isMinting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              className="h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isMinting}
            >
              {isMinting ? "Minting..." : "Mint & List NFT"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
