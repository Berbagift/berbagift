export interface UserBalances {
  XLM: number;
  USDC: number;
  RPK: number;
  total_xlm?: number;
}

export interface UserBalancesIdr {
  XLM: number;
  USDC: number;
  RPK: number;
  total: number;
}

export interface UserProfile {
  id: string;
  username: string;
  initials: string;
  role: string;
  avatar_url?: string;
  balances: UserBalances;
  balances_idr: UserBalancesIdr;
}
