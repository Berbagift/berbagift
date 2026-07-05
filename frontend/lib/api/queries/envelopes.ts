import { useQuery } from '@tanstack/react-query';
import { envelopesService } from '../services';

/**
 * Hook to retrieve preset envelope design templates.
 */
export function useEnvelopes() {
  return useQuery({
    queryKey: ['envelopes'],
    queryFn: async () => {
      return envelopesService.getEnvelopes();
    },
    staleTime: 1000 * 60 * 60,
  });
}
