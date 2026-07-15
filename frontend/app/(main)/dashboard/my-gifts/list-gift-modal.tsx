'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { buildListItemTx } from '@/lib/stellar/marketplace';
import { submitTransaction } from '@/lib/stellar/transactions';
import { toast } from 'react-toastify';

const XLM_ADDRESS = process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
const RPK_ADDRESS = process.env.NEXT_PUBLIC_RPK_CONTRACT || 'CAXMJUKELFC7THVUKVH4NA5RYUDLORCKSZ5HTOPOMEXRMZJLFHKZJCQZ';

interface ListGiftModalProps {
  tokenId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ListGiftModal({ tokenId, isOpen, onClose, onSuccess }: ListGiftModalProps) {
  const { publicKey, signTransaction } = useWalletStore();
  const [price, setPrice] = useState('');
  const [paymentToken, setPaymentToken] = useState<'XLM' | 'RPK'>('XLM');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast.error('Wallet not connected');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentTokenAddress = paymentToken === 'XLM' ? XLM_ADDRESS : RPK_ADDRESS;

      const txXdr = await buildListItemTx(publicKey, tokenId, paymentTokenAddress, price);
      const signedXdr = await signTransaction(txXdr, 'testnet');
      await submitTransaction(signedXdr);

      toast.success(`Gift #${tokenId} listed for ${price} ${paymentToken}`);
      onSuccess();
    } catch (err: any) {
      console.error('List gift failed:', err);
      toast.error(err.message || 'Failed to list gift. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-black dark:text-neutral-1">List Gift #{tokenId}</h2>
          <button
            onClick={onClose}
            className="text-neutral-5 hover:text-black dark:hover:text-neutral-1 cursor-pointer transition-colors"
            disabled={isProcessing}
          >
            <i className="fi fi-rr-cross text-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Payment Token Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-8">Payment Token</label>
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

          {/* Price Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-8">
              Price ({paymentToken})
            </label>
            <Input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={`0.00 ${paymentToken}`}
              className="w-full"
              disabled={isProcessing}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 border-border text-neutral-7 hover:text-black dark:hover:text-neutral-1 font-semibold h-10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-10 cursor-pointer"
            >
              {isProcessing ? 'Listing...' : 'Confirm Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
