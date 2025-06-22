import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import type { IProfileSettings, IProfileUpdate } from '@/types';

export const getUserInSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfileInSession = cache(async () => {
  const user = await getUserInSession();
  if (!user) {
    return null;
  }
  const profile = await getProfileByUserId(user.id);
  return profile;
});

export const getProfileByUserId = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return profile;
});

export const getProfileSettings = async (userId: string): Promise<IProfileSettings | null> => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
};

export const updateProfileSettings = async (
  userId: string,
  updates: IProfileUpdate,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> => {
  const supabase = await createClient();

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return { url: data.publicUrl };
};
