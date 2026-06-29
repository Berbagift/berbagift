import { apiClient, unwrapApiData } from '../client';
import { Activity } from '../types';
import activitiesData from '@/mockapi/activities.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

export const activitiesService = {
  /**
   * Retrieve current user's transaction/activity logs.
   */
  getActivities: async (): Promise<Activity[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return activitiesData as Activity[];
    }

    const res = await apiClient.get<Activity[] | { data: Activity[] }>('/activities');
    return unwrapApiData<Activity[]>(res.data);
  },
};
