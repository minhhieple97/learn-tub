import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type {
  IProfileUpdate,
  IFileUploadResult,
  IProfileHookReturn,
  IAvatarUploadHookReturn,
} from '@/types';
import { USER_PROFILE_QUERY_KEY } from '@/components/queries-client/user-profile';

export const useProfileSettings = (): IProfileHookReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: IProfileUpdate) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setUpdateError(null);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update profile';
      setUpdateError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const updateProfile = useCallback(
    async (data: IProfileUpdate) => {
      setIsUpdating(true);
      setUpdateError(null);
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation],
  );

  return {
    updateProfile,
    isUpdating,
    updateError,
    data: undefined,
    isLoading: false,
    error: updateError,
  };
};

export const useAvatarUpload = (): IAvatarUploadHookReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadAvatar = useCallback(async (file: File): Promise<IFileUploadResult> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      });

      return { url: result.url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      setUploadError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return { url: '', error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadAvatar,
    isUploading,
    uploadError,
  };
};
