import { apiClient, unwrapApiData } from '../client';
import { Activity } from '../types';
import activitiesData from '@/mockapi/activities.json';
import { formatDistanceToNow } from 'date-fns';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

function normalizeActivityItem(item: any): Activity {
  let icon = 'fi-rr-exchange';
  let iconBgClass = 'bg-[#eff6ff] dark:bg-blue-900/30';
  let iconColorClass = 'text-[#3b82f6]';
  
  if (item.activity_type === 'Swap token') {
    icon = 'fi fi-rr-shuffle';
    iconBgClass = 'bg-[#eff6ff] dark:bg-blue-900/30';
    iconColorClass = 'text-[#3b82f6]';
  } else if (item.activity_type === 'Deposit Liquidity') {
    icon = 'fi fi-rr-coins';
    iconBgClass = 'bg-[#fffbeb] dark:bg-amber-900/30';
    iconColorClass = 'text-[#f59e0b]';
  } else if (item.activity_type === 'Sent token') {
    icon = 'fi fi-rr-paper-plane';
    iconBgClass = 'bg-[#eafdf0] dark:bg-green-900/30';
    iconColorClass = 'text-[#16a34a]';
  } else if (item.activity_type === 'Received token') {
    icon = 'fi fi-rr-download';
    iconBgClass = 'bg-[#eafdf0] dark:bg-green-900/30';
    iconColorClass = 'text-[#16a34a]';
  }

  let timeStr = item.datetime;
  try {
    if (timeStr) {
      timeStr = formatDistanceToNow(new Date(timeStr), { addSuffix: true });
    }
  } catch (e) {
    // Fallback to raw string
  }

  return {
    id: (item._id && item._id.$oid) ? item._id.$oid : item.transaction_hash,
    type: item.activity_type,
    details: item.details,
    amount: item.amount,
    status: item.status ? item.status.toLowerCase() : 'success',
    time: timeStr || 'Just now',
    txHash: item.transaction_hash,
    datetime: item.datetime,
    icon,
    iconBgClass,
    iconColorClass
  };
}

export const activitiesService = {
  getActivities: async (): Promise<Activity[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return activitiesData as Activity[];
    }

    const res = await apiClient.get<any>('/activities');
    const rawData = unwrapApiData<any[]>(res.data);
    return rawData.map(normalizeActivityItem);
  },
};
