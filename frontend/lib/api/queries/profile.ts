import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile';
import { getErrorMessage } from '../client';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username?: string; email?: string }) => 
      profileService.updateProfile(data),
    onSuccess: (data) => {
      // Optimistically update the cached profile with the new data from the mutation response
      queryClient.setQueryData(['userProfile'], (oldData: any) => {
        if (!oldData) return data;
        return {
          ...oldData,
          ...data,
        };
      });
      // Also invalidate to ensure it syncs fresh in the background
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Update profile error:', getErrorMessage(error));
    },
  });
}
