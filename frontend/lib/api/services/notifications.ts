import { apiClient, unwrapApiData } from '../client';
import { InboxMailItemData } from '@/components/inbox/InboxMailItem';
import notificationsData from '@/mockapi/notifications.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

export const notificationsService = {
  /**
   * Retrieve notification lists.
   */
  getNotifications: async (): Promise<InboxMailItemData[]> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return notificationsData as InboxMailItemData[];
    }

    const res = await apiClient.get<any>('/notifications');
    return unwrapApiData<InboxMailItemData[]>(res.data);
  },

  /**
   * Update single notification item (e.g. toggle read status).
   */
  updateNotification: async (id: string, updates: Partial<InboxMailItemData>): Promise<InboxMailItemData> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const item = notificationsData.find((n) => n.id === id);
      return { ...item, ...updates } as InboxMailItemData;
    }

    const res = await apiClient.patch<any>(`/notifications/${id}`, updates);
    return unwrapApiData<InboxMailItemData>(res.data);
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async (category?: string): Promise<void> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    await apiClient.post('/notifications/mark-all-read', { category });
  }
};
