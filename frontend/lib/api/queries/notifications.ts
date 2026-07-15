import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications';
import { InboxMailItemData } from '@/components/inbox/InboxMailItem';

/**
 * Hook to retrieve user notifications and inbox messages.
 * Uses regular polling every 5 seconds.
 */
export function useNotifications(category?: string) {
  return useQuery({
    queryKey: ['notifications', category],
    queryFn: async () => {
      return notificationsService.getNotifications(category);
    },
    refetchInterval: false as const,
    staleTime: 3000,
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
