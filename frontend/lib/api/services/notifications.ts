import { apiClient } from '../client';
import { InboxMailItemData } from '@/components/inbox/InboxMailItem';
import notificationsData from '@/mockapi/notifications.json';

const isLocalMode = process.env.NEXT_PUBLIC_API_MODE === 'local';

export const notificationsService = {
  /**
   * Retrieve notification lists.
   */
  getNotifications: async (category?: string): Promise<{ items: InboxMailItemData[], counts: Record<string, number> }> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { items: notificationsData as InboxMailItemData[], counts: {} };
    }

    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      const res = await apiClient.get(`/activities/inbox${query}`);
      const apiData: unknown[] = res.data?.data?.items || [];
      const counts: Record<string, number> = res.data?.data?.counts || {};

      const items: InboxMailItemData[] = apiData.map((item) => {
        const it = item as Record<string, unknown>;
        const titleLower = (it.title as string || '').toLowerCase();
        let cat: 'Rewards' | 'Rooms' | 'Transfer' | 'Swap' | 'System' = 'System';

        if (titleLower.includes('transfer')) cat = 'Transfer';
        else if (titleLower.includes('swap')) cat = 'Swap';
        else if (titleLower.includes('reward') || titleLower.includes('claim')) cat = 'Rewards';
        else if (titleLower.includes('room')) cat = 'Rooms';
        else if (titleLower.includes('token listed') || titleLower.includes('deposit')) cat = 'System';

        return {
          id: it.id as string,
          title: it.title as string,
          description: it.description as string,
          date: new Date(it.datetime as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: cat,
          read: (it.is_read as boolean) || false,
          _datetime: it.datetime as string,
          details: {
            txHash: it.tx_hash as string | undefined,
            amount: it.transaction_value as string | undefined,
            username: it.sender_or_recipient as string | undefined,
            message: it.message as string | undefined,
            roomName: it.room_name as string | undefined,
            roomId: it.room_id as string | number | undefined
          }
        };
      });
      return { items, counts };
    } catch (e) {
      console.error('Failed to fetch inbox:', e);
      return { items: [], counts: {} };
    }
  },

  /**
   * Update single notification item (e.g. toggle read status).
   */
  updateNotification: async (id: string, updates: Partial<InboxMailItemData>): Promise<InboxMailItemData> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { id, ...updates } as InboxMailItemData;
    }

    // Connect to actual backend PATCH /activities/inbox/:id
    try {
      await apiClient.patch(`/activities/inbox/${id}`, {
        read: updates.read
      });
    } catch (e) {
      console.error('Failed to update inbox item:', e);
    }

    return { id, ...updates } as InboxMailItemData;
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async (category?: string): Promise<void> => {
    if (isLocalMode) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    try {
      await apiClient.post('/activities/inbox/mark-all-read', {
        category: category === 'All Notification' ? undefined : category
      });
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  }
};
