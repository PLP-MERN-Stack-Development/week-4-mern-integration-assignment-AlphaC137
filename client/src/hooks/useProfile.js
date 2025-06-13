// useProfile.js - Custom hook for user profile operations

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery(
    'userProfile',
    authService.getProfile,
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => authService.updateProfile(profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userProfile');
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      },
    }
  );
  
  // Change password mutation
  const changePasswordMutation = useMutation(
    (passwordData) => authService.changePassword(passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.error || 'Failed to change password'
        );
      },
    }
  );
  
  return {
    profile: profileData?.data,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isLoading,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isLoading,
  };
};
