import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services';

/**
 * Hook to retrieve user transaction and activity logs.
 */
export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      return activitiesService.getActivities();
    },
    staleTime: 1000 * 30,
  });
}
