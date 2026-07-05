export interface UserBalances {
  XLM: number;
  USDC: number;
}

export interface UserBalancesIdr {
  XLM: number;
  USDC: number;
}

export interface UserProfile {
  id: string;
  username: string;
  initials: string;
  role: string;
  balances: UserBalances;
  balances_idr: UserBalancesIdr;
}
