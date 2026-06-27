import { useQuery } from '@tanstack/react-query';
import { fetchBinanceKlines } from '../binance';

export function useBinanceKlines(symbol: string, activeRange: string) {
  const rangeConfig: Record<string, { interval: string, limit: number }> = {
    '1 Day': { interval: '15m', limit: 500 }, // Get more data for scrollback
    '1 Week': { interval: '1h', limit: 500 },
    '1 Month': { interval: '4h', limit: 500 },
    '1 Year': { interval: '1d', limit: 1000 },
    '3 Year': { interval: '1w', limit: 1000 },
    '5 Year': { interval: '1M', limit: 1000 },
  };

  const config = rangeConfig[activeRange] || rangeConfig['1 Month'];

  return useQuery({
    queryKey: ['binance-klines', symbol, activeRange],
    queryFn: () => fetchBinanceKlines(symbol, config.interval, config.limit),
    staleTime: 1000 * 60 * 2, // Cache stale after 2 minutes
    refetchInterval: 1000 * 60, // Refetch every 1 minute for live update
  });
}
