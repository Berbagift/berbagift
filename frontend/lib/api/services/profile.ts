/*
================================================================================
SIWS AUTH & USER PROFILE INTEGRATION PLANNING REFERENCE
(Do not uncomment/implement until backend API contracts are aligned)
================================================================================

export interface NonceResponse {
  nonce: string;
}

export interface SignInResponse {
  user_id: string;
  access_token: string;
}

export const authService = {
  // Fetch authentication challenge nonce
  getNonce: async (walletAddress: string): Promise<ApiResponse<NonceResponse>> => {
    const res = await apiClient.post<ApiResponse<NonceResponse>>('/auth/nonce', {
      wallet_address: walletAddress
    });
    return res.data;
  },

  // Verify signature and authenticate session
  signIn: async (walletAddress: string, signature: string): Promise<ApiResponse<SignInResponse>> => {
    const res = await apiClient.post<ApiResponse<SignInResponse>>('/auth/sign-in', {
      wallet_address: walletAddress,
      signature
    });
    return res.data;
  }
};
*/

import { apiClient, unwrapApiData } from '../client';
import type { UserProfile } from '../types/profile';

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get('/auth/me');
    return unwrapApiData(res.data);
  },

  updateProfile: async (data: { username?: string; email?: string }): Promise<UserProfile> => {
    const res = await apiClient.put('/auth/me', data);
    return unwrapApiData(res.data);
  }
};
