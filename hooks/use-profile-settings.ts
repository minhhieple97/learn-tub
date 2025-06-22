import { useCallback } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { updateProfileAction, uploadAvatarAction } from '@/features/auth/actions';
import { USER_PROFILE_QUERY_KEY } from '@/features/auth/constants';
import type { IProfileUpdate, IFileUploadResult } from '@/types';

export const useProfileSettings = () => {
  const queryClient = useQueryClient();

  const { execute, isPending, result } = useAction(updateProfileAction, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      toast({
        title: 'Success',
        description: data?.message || 'Profile updated successfully',
      });
    },
    onError: ({ error }) => {
      toast({
        title: 'Error',
        description: error.serverError || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const updateProfile = useCallback(
    async (data: IProfileUpdate) => {
      execute(data);
    },
    [execute],
  );

  return {
    updateProfile,
    isUpdating: isPending,
    updateError: result?.serverError || null,
    result,
  };
};

export const useAvatarUpload = () => {
  const queryClient = useQueryClient();

  const { executeAsync, isPending, result } = useAction(uploadAvatarAction, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      toast({
        title: 'Success',
        description: data?.message || 'Avatar uploaded successfully',
      });
    },
    onError: ({ error }) => {
      toast({
        title: 'Error',
        description: error.serverError || 'Failed to upload avatar',
        variant: 'destructive',
      });
    },
  });

  const uploadAvatar = useCallback(
    async (file: File): Promise<IFileUploadResult> => {
      try {
        const actionResult = await executeAsync({ file });

        if (actionResult?.data?.url) {
          return { url: actionResult.data.url };
        }

        return {
          url: '',
          error: 'Failed to upload avatar',
        };
      } catch (error) {
        return {
          url: '',
          error: 'Failed to upload avatar',
        };
      }
    },
    [executeAsync],
  );

  return {
    uploadAvatar,
    isUploading: isPending,
    uploadError: result?.serverError || null,
  };
};
