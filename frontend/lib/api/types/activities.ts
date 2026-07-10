export interface Activity {
  id: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  type: string;
  details: string;
  amount: string;
  status: 'success' | 'processing' | 'expired';
  time: string;
  txHash?: string;
}
