'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { buildNftGiftTx, submitNftGiftTx } from '@/lib/stellar/nft-gift';
import { buildListItemTx } from '@/lib/stellar/marketplace';
import { submitTransaction } from '@/lib/stellar/transactions';
import { pinFileToIPFS, pinJSONToIPFS } from '@/lib/pinata';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const XLM_ADDRESS = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
const RPK_ADDRESS = process.env.NEXT_PUBLIC_RPK_CONTRACT || 'CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MintNFTModal({ isOpen, onClose }: MintNFTModalProps) {
  const { publicKey, signTransaction } = useWalletStore();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [price, setPrice] = useState('');
  const [paymentToken, setPaymentToken] = useState<'XLM' | 'RPK'>('XLM');
  const [step, setStep] = useState<'form' | 'uploading' | 'minting' | 'listing'>('form');

  if (!isOpen) return null;

  const closeModal = () => {
    setImageFile(null);
    setImagePreview('');
    setPrice('');
    setPaymentToken('XLM');
    setStep('form');
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!publicKey) {
      toast.error('Wallet not connected');
      return;
    }
    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      // ── Step 1: Upload image to IPFS ──
      setStep('uploading');
      const imageHash = await pinFileToIPFS(imageFile, {
        name: `Berbagift-mint-${Date.now()}`,
      });

      // ── Step 2: Create metadata JSON on IPFS ──
      const metadataHash = await pinJSONToIPFS(
        {
          name: 'Berbagift Custom NFT',
          description: 'Custom NFT minted on Berbagift Platform',
          image: `ipfs://${imageHash}`,
          attributes: [
            { trait_type: 'Platform', value: 'Berbagift' },
            { trait_type: 'Mint Date', value: new Date().toISOString() },
          ],
        },
        { name: `Berbagift-mint-metadata-${Date.now()}` }
      );
      const tokenUri = `ipfs://${metadataHash}`;

      // ── Step 3: Self-mint (send to self via NFT contract) ──
      setStep('minting');
      const mintTxXdr = await buildNftGiftTx(
        publicKey,
        paymentToken === 'XLM' ? XLM_ADDRESS : RPK_ADDRESS,
        [
          {
            walletAddress: publicKey,
            amount: '0.0000001', // minimum stroop to satisfy contract
            message: '',
            tokenUri,
          },
        ]
      );
      const signedMintXdr = await signTransaction(mintTxXdr, 'testnet');
      const mintResult = await submitNftGiftTx(signedMintXdr);

      const tokenId = mintResult.tokenId;
      if (!tokenId) {
        toast.warn('NFT minted but could not determine token ID. It will appear in My Gifts shortly.');
        closeModal();
        return;
      }

      // ── Step 4: List on marketplace ──
      setStep('listing');
      const paymentTokenAddress = paymentToken === 'XLM' ? XLM_ADDRESS : RPK_ADDRESS;
      const listTxXdr = await buildListItemTx(publicKey, tokenId, paymentTokenAddress, price);
      const signedListXdr = await signTransaction(listTxXdr, 'testnet');
      await submitTransaction(signedListXdr);

      toast.success(`NFT minted & listed for ${price} ${paymentToken}!`);
      queryClient.invalidateQueries({ queryKey: ['nfts', publicKey] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_nfts'] });
      closeModal();
    } catch (err: any) {
      console.error('Mint & List failed:', err);
      toast.error(err.message || 'Failed to mint NFT. Please try again.');
      setStep('form');
    }
  };

  const isProcessing = step !== 'form';

  const stepLabels: Record<string, string> = {
    uploading: 'Uploading image to IPFS...',
    minting: 'Minting NFT on-chain...',
    listing: 'Listing on marketplace...',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) closeModal();
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
              Mint &amp; List NFT 🎨
            </h2>
            <p className="text-sm font-medium text-neutral-8 dark:text-neutral-4">
              Upload a custom image, mint it as an NFT, and list it on the marketplace.
            </p>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <p className="text-sm font-medium text-neutral-7">{stepLabels[step]}</p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Minting preview"
                  className="w-24 h-24 object-cover rounded-lg opacity-60"
                />
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black dark:text-neutral-1">
                    Upload Image <span className="text-red-500">*</span>
                  </label>

                  <div className="relative flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-border hover:border-emerald-500 dark:hover:border-emerald-400 bg-neutral-50 dark:bg-neutral-900 rounded-md transition-colors cursor-pointer overflow-hidden group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain absolute inset-0 p-2" />
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

                {/* Payment Token */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black dark:text-neutral-1">Payment Token</label>
                  <div className="flex gap-2">
                    {(['XLM', 'RPK'] as const).map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() => setPaymentToken(token)}
                        className={`flex-1 py-2.5 rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
                          paymentToken === token
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-card text-neutral-7 border-border hover:border-emerald-400'
                        }`}
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="nft-price" className="text-sm font-semibold text-black dark:text-neutral-1">
                    Listing Price ({paymentToken}) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nft-price"
                    type="number"
                    placeholder={`e.g. 50`}
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
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMint}
                  className="h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Mint &amp; List NFT
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
