import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications';
import { InboxMailItemData } from '@/components/inbox/InboxMailItem';

/**
 * Hook to retrieve user notifications and inbox messages.
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      return notificationsService.getNotifications();
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Mutation hook to toggle the read status of a notification.
 */
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InboxMailItemData> }) => {
      return notificationsService.updateNotification(id, updates);
    },
    onSuccess: () => {
      // Invalidate query to refetch updated state
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mutation hook to mark all notifications as read.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category?: string) => {
      return notificationsService.markAllRead(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
