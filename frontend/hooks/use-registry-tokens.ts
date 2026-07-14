import { useQuery } from '@tanstack/react-query';
import { TokenConfig, TOKENS } from '@/lib/data/tokens';
import { apiClient } from '@/lib/api/client';

const fetchRegistryTokens = async () => {
  const res = await apiClient.get<any>('/tokens/registry');
  return res.data;
};

export function useRegistryTokens() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['registry-tokens'],
    queryFn: fetchRegistryTokens,
  });

  let registryTokens: TokenConfig[] = [];
  if (data?.data) {
    registryTokens = data.data.map((t: any) => {
      const mockToken = Object.values(TOKENS).find(mt => mt.symbol === t.symbol);
      return {
        id: t.token_address || t.symbol, 
        symbol: t.symbol,
        name: mockToken?.name || t.symbol,
        logoIcon: mockToken?.logoIcon || '',
        logoBg: mockToken?.logoBg || '#E2E8F0',
        balance: mockToken?.balance || 0,
        equivalentIdr: mockToken?.equivalentIdr || 0,
        percentageChange: mockToken?.percentageChange || 0,
        chartData: mockToken?.chartData || []
      };
    });
  }

  if (registryTokens.length === 0) {
    registryTokens = Object.values(TOKENS);
  }

  const getToken = (idOrSymbol: string) => {
    return registryTokens.find(t => t.id === idOrSymbol || t.symbol === idOrSymbol) || registryTokens[0];
  };

  return { tokens: registryTokens, getToken, error, isLoading };
}
