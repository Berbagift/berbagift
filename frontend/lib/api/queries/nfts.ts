import { useQuery } from '@tanstack/react-query';
import { apiClient, unwrapApiData } from '../client';
import { useWalletStore } from '@/hooks/use-wallet-state';

export function useNfts() {
  const { publicKey } = useWalletStore();

  return useQuery({
    queryKey: ['nfts', publicKey],
    queryFn: async () => {
      if (!publicKey) return [];
      const res = await apiClient.get<any>(`/nfts?wallet_address=${publicKey}`);
      return unwrapApiData<any[]>(res.data);
    },
    enabled: !!publicKey,
  });
}
