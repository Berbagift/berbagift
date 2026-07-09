import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface CryptoPriceData {
  idr: number;
  idr_24h_change: number;
}

export interface CryptoPricesResponse {
  stellar: CryptoPriceData;
  'usd-coin': CryptoPriceData;
}

/**
 * Hook to retrieve real-time crypto prices and 24h percentage changes
 * from CoinGecko API.
 */
export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      // Fetch prices for Stellar (XLM) and USDC against IDR
      const { data } = await axios.get<CryptoPricesResponse>(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'stellar,usd-coin',
            vs_currencies: 'idr',
            include_24hr_change: 'true',
          },
        }
      );
      return data;
    },
    // Cache for 1 minute to avoid rate limits while keeping data fresh
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 1,
  });
}
