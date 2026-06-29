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

    const res = await apiClient.get<TokenConfig[] | { data: TokenConfig[] }>('/tokens');
    return unwrapApiData<TokenConfig[]>(res.data);
  },
};
