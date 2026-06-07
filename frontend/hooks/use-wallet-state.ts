import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  publicKey: string | null;
  userId: number | null;
  isConnected: boolean;
  connect: (publicKey: string, userId?: number) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      publicKey: null,
      userId: null,
      isConnected: false,
      connect: (publicKey: string, userId?: number) => set({ publicKey, userId: userId || null, isConnected: true }),
      disconnect: () => set({ publicKey: null, userId: null, isConnected: false }),
    }),
    {
      name: 'bagithr-wallet-storage',
    }
  )
);
