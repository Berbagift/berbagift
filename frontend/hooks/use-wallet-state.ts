import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signTransaction as freighterSignTransaction } from '@stellar/freighter-api';

interface WalletState {
  publicKey: string | null;
  userId: number | null;
  isConnected: boolean;
  connect: (publicKey: string, userId?: number) => void;
  disconnect: () => void;
  signTransaction: (xdr: string, network: string) => Promise<string>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      publicKey: null,
      userId: null,
      isConnected: false,
      connect: (publicKey: string, userId?: number) => set({ publicKey, userId: userId || null, isConnected: true }),
      disconnect: () => set({ publicKey: null, userId: null, isConnected: false }),
      signTransaction: async (xdr: string, network: string) => {
        const networkPassphrase = network.toLowerCase() === 'testnet' 
          ? "Test SDF Network ; September 2015" 
          : "Public Global Stellar Network ; September 2015";
          
        const { signedTxXdr, error } = await freighterSignTransaction(xdr, { 
          networkPassphrase,
        });
        if (error) throw new Error(error);
        if (!signedTxXdr) throw new Error("No signature returned");
        return signedTxXdr;
      },
    }),
    {
      name: 'bagithr-wallet-storage',
      partialize: (state) => ({ publicKey: state.publicKey, userId: state.userId, isConnected: state.isConnected }),
    }
  )
);
