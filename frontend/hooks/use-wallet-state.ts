import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  connect: (publicKey: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      publicKey: null,
      isConnected: false,
      connect: (publicKey: string) => set({ publicKey, isConnected: true }),
      disconnect: () => set({ publicKey: null, isConnected: false }),
    }),
    {
      name: 'bagithr-wallet-storage',
    }
  )
);
