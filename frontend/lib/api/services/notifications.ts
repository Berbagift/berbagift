import { apiClient, unwrapApiData } from '../client';
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
      const res = await apiClient.get<any>(`/activities/inbox${query}`);
      const apiData = res.data?.data?.items || [];
      const counts = res.data?.data?.counts || {};
      
      const items = apiData.map((item: any) => {
        let cat: 'Rewards' | 'Rooms' | 'Transfer' | 'Swap' | 'System' = 'System';
        const titleLower = (item.title || '').toLowerCase();
        
        if (titleLower.includes('transfer')) cat = 'Transfer';
        else if (titleLower.includes('swap')) cat = 'Swap';
        else if (titleLower.includes('reward') || titleLower.includes('claim')) cat = 'Rewards';
        else if (titleLower.includes('room')) cat = 'Rooms';
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          date: new Date(item.datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          category: cat,
          read: item.is_read || false,
          details: {
            txHash: item.tx_hash,
            amount: item.transaction_value,
            username: item.sender_or_recipient
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
