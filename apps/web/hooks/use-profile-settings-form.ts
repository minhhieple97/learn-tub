import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfileSettings, useAvatarUpload } from '@/hooks/use-profile-settings';
import { ProfileSchema } from '@/features/settings/schemas';
import type { ProfileFormData } from '@/features/settings/types';
import type { IUserProfile } from '@/types';

type UseProfileSettingsFormProps = {
  userProfile: IUserProfile;
};

export const useProfileSettingsForm = ({ userProfile }: UseProfileSettingsFormProps) => {
  const { updateProfile, isUpdating } = useProfileSettings();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  // Update form when user profile loads
  useEffect(() => {
    if (userProfile) {
      reset({
        full_name: userProfile.full_name || '',
      });
      setAvatarUrl(userProfile.avatar_url || null);
    }
  }, [userProfile, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if (result.url) {
      setAvatarUrl(result.url);
      await updateProfile({ avatar_url: result.url });
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile({
      full_name: data.full_name,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    });
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleReset = () => {
    reset();
  };

  return {
    // Form state
    form,
    errors,
    isDirty,

    // Data
    userProfile,
    avatarUrl,

    // Loading states
    isUpdating,
    isUploading,

    // Refs
    fileInputRef,

    // Handlers
    handleSubmit: handleSubmit(onSubmit),
    handleAvatarClick,
    handleFileChange,
    handleReset,

    // Utils
    getUserInitials,
  };
};
