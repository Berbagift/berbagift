import axios from 'axios';

// Separate Axios client for Binance API (external API)
export const binanceClient = axios.create({
  baseURL: 'https://api.binance.com/api/v3',
  timeout: 8000,
});

export interface BinanceKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type BinanceKlineResponse = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

export const fetchBinanceKlines = async (
  symbol: string,
  interval: string,
  limit: number,
  endTime?: number,
  signal?: AbortSignal
): Promise<BinanceKline[]> => {
  // Normalize symbol (e.g. XLM -> XLMUSDT, USDC -> USDCUSDT)
  let binanceSymbol = `${symbol}USDT`;
  if (symbol === 'USDC') binanceSymbol = 'USDCUSDT';
  if (symbol === 'XLM') binanceSymbol = 'XLMUSDT';

  const { data } = await binanceClient.get<BinanceKlineResponse[]>('/klines', {
    params: {
      symbol: binanceSymbol,
      interval,
      limit,
      endTime,
    },
    signal,
  });

  return data.map((d) => ({
    time: d[0] / 1000, // Convert to seconds for lightweight-charts
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
  }));
};
