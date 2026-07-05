import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBinanceKlines } from '../binance';


export function useBinanceKlinesInfinite(symbol: string, activeRange: string) {
  const rangeConfig: Record<string, { interval: string, limit: number }> = {
    '1 Day': { interval: '15m', limit: 200 },
    '1 Week': { interval: '1h', limit: 200 },
    '1 Month': { interval: '4h', limit: 200 },
    '1 Year': { interval: '1d', limit: 300 },
    '3 Year': { interval: '1w', limit: 300 },
    '5 Year': { interval: '1M', limit: 120 },
  };

  const config = rangeConfig[activeRange] || rangeConfig['1 Month'];

  return useInfiniteQuery({
    queryKey: ['binance-klines-infinite', symbol, activeRange],
    queryFn: ({ pageParam, signal }) =>
      fetchBinanceKlines(symbol, config.interval, config.limit, pageParam, signal),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      const oldestCandleTimeMs = lastPage[0].time * 1000;
      return oldestCandleTimeMs - 1;
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60,
  });
}
