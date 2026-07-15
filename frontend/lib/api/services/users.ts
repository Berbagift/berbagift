import { apiClient, unwrapApiData } from '../client';
import { ApiResponse } from '../types/api';

export interface UserLookupData {
  id: number;
  username: string;
  wallet_address: string;
}

export const usersService = {
  getUserByUsername: async (username: string): Promise<UserLookupData> => {
    const res = await apiClient.get<ApiResponse<UserLookupData>>(`/users/${username}`);
    return unwrapApiData(res.data);
  }
};
