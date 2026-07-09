"use client";

import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/auth';
import { apiClient } from '@/lib/api/client';

export function useUserProfile() {
  const query = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        // [DEV MODE] Return null instead of throwing to allow dashboard access without auth
        return null;
        // throw new Error('No authentication token found');
      }

      const res = await apiClient.get('/auth/me');
      return res.data.data;
    },
    retry: false, // Do not retry on 401 Unauthorized
    refetchOnWindowFocus: true,
  });

  // =============================================================
  // [DEV MODE] Auto-logout disabled for UI development.
  // Uncomment the block below to re-enable auto-logout on auth failure.
  // =============================================================
  // useEffect(() => {
  //   // If the query fails (e.g., 401 Unauthorized), auto-logout the user
  //   if (query.isError) {
  //     removeAuthToken();
  //     useWalletStore.getState().disconnect();
  //     router.push('/');
  //   }
  // }, [query.isError, router]);

  return query;
}
