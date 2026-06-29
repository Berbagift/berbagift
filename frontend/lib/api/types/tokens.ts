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
