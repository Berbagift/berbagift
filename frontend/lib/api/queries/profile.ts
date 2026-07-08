import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile';
import { getErrorMessage } from '../client';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username?: string; email?: string }) => 
      profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      console.error('Update profile error:', getErrorMessage(error));
    },
  });
}
