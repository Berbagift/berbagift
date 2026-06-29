import tokensData from '@/mockapi/tokens.json';

export interface ChartDataPoint {
  date: string;
  balance: number;
}

export interface TokenConfig {
  id: string;
  symbol: string;
  name: string;
  logoIcon: string;
  logoBg: string;
  balance: number;
  equivalentIdr: number;
  percentageChange: number;
  chartData: ChartDataPoint[];
}

export const TOKENS: Record<string, TokenConfig> = (tokensData as TokenConfig[]).reduce(
  (acc, token) => {
    acc[token.id] = token;
    return acc;
  },
  {} as Record<string, TokenConfig>
);
