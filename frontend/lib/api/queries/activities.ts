import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services';

/**
 * Hook to retrieve user transaction and activity logs.
 * Uses regular polling every 5 seconds.
 */
export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      return activitiesService.getActivities();
    },
    refetchInterval: false as const,
    staleTime: 3000,
  });
}
