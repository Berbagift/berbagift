import { useQuery } from '@tanstack/react-query';
import { tokensService } from '../services';

/**
 * Hook to retrieve active token configurations and chart history.
 */
export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      return tokensService.getTokens();
    },
    staleTime: 1000 * 60 * 1,
  });
}
