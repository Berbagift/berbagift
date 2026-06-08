"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken, removeAuthToken } from '@/lib/auth';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useUserProfile() {
  const router = useRouter();
  
  const query = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.data.data;
    },
    retry: false, // Do not retry on 401 Unauthorized
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    // If the query fails (e.g., 401 Unauthorized), auto-logout the user
    if (query.isError) {
      removeAuthToken();
      useWalletStore.getState().disconnect();
      router.push('/');
    }
  }, [query.isError, router]);

  return query;
}
