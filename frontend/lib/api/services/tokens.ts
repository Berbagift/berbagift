import { apiClient, unwrapApiData } from '../client';
import { TokenConfig } from '../types';
import tokensData from '@/mockapi/tokens.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

export const tokensService = {
  /**
   * Retrieve active cryptographic token configurations, balances, and chart histories.
   */
  getTokens: async (): Promise<TokenConfig[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return tokensData as TokenConfig[];
    }

    const res = await apiClient.get<any>('/tokens/registry');
    const registryData = unwrapApiData<any[]>(res.data);
    
    // Merge with mock data to get logos and charts
    const tokens = registryData.map((t) => {
      const mockToken = (tokensData as TokenConfig[]).find(mt => mt.symbol === t.symbol);
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
      } as TokenConfig;
    });

    return tokens;
  },
};
