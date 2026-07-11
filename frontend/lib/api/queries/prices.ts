import { useQuery } from '@tanstack/react-query';

import { apiClient, unwrapApiData } from '@/lib/api/client';

export interface CryptoPriceData {
  idr: number;
  idr_24h_change: number;
}

export interface CryptoPricesResponse {
  stellar: CryptoPriceData;
  rpk: CryptoPriceData;
}

/**
 * Hook to retrieve real-time crypto prices and 24h percentage changes.
 * XLM uses Indodax (via backend) and USDC uses CoinGecko.
 */
export function useCryptoPrices() {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      // 1. RPK is 1:1 with IDR
      const rpkData: CryptoPriceData = { idr: 1, idr_24h_change: 0 };

      // 2. Fetch XLM from our backend (which queries Indodax based on cek_harga.py)
      let xlmData: CryptoPriceData = { idr: 1600, idr_24h_change: 0 };
      try {
        const response = await apiClient.get('/tokens/market-stats');
        const stats = unwrapApiData(response.data) as any;
        if (stats?.XLM) {
          xlmData = {
            idr: stats.XLM.price,
            idr_24h_change: stats.XLM.change_24h
          };
          
          console.log("=== Status XLM (Indodax API - Via Backend) ===");
          console.log(`Harga 24j Lalu : Rp ${stats.XLM.price / (1 + (stats.XLM.change_24h / 100))}`); // Estimasi harga lalu
          console.log(`Harga Sekarang : Rp ${stats.XLM.price}`);
          console.log(`Perubahan      : ${stats.XLM.change_24h > 0 ? '📈 Naik' : '📉 Turun'} ${Math.abs(stats.XLM.change_24h).toFixed(2)}%`);
          console.log("--------------------------------");
        }
      } catch (err) {
        console.warn('Failed to fetch XLM from backend.', err);
      }

      const result: CryptoPricesResponse = {
        stellar: xlmData,
        rpk: rpkData
      };
      
      return result;
    },
    // Cache for 1 minute to avoid rate limits while keeping data fresh
    staleTime: 1000 * 60 * 1,
    refetchInterval: 1000 * 60 * 1,
  });
}
