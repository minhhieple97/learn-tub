import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { IProfileSettings, IProfileUpdate } from "@/types";

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
  return await getProfileByUserId(user.id);
});

export const getProfileByUserId = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
});

export const getProfileSettings = async (
  userId: string,
): Promise<IProfileSettings | null> => {
  return await getProfileByUserId(userId);
};

export const updateProfile = async (
  userId: string,
  updates: IProfileUpdate,
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

export const uploadAvatarFile = async (
  userId: string,
  file: File,
  options: {
    bucket?: string;
    cacheControl?: string;
    upsert?: boolean;
  } = {},
): Promise<{ url?: string; filePath?: string; error?: string }> => {
  const supabase = await createClient();

  const { bucket = "avatars", cacheControl = "3600", upsert = false } = options;

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl,
      upsert,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: publicUrl, filePath };
};

export const updateProfileAvatar = async (
  userId: string,
  avatarUrl: string,
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile avatar:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
