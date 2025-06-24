'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { action, ActionError, authAction } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, updateProfileSchema, uploadAvatarSchema } from '../schemas';
import { AVATAR_UPLOAD_CONFIG, AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES } from '../constants';
import { routes } from '@/routes';
import { z } from 'zod';
import {
  getUserInSession,
  updateProfile,
  uploadAvatarFile,
  updateProfileAvatar,
} from '@/features/profile/queries';
import { checkProfileByUserId } from '@/lib/require-auth';
import { CacheClient } from '@/lib/cache';

export const loginAction = action
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ActionError(error.message);
    }
    revalidatePath(routes.learn, 'layout');
    redirect(routes.learn);
  });

export const registerAction = action
  .inputSchema(registerSchema)
  .action(async ({ parsedInput: { email, password, fullName } }) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      throw new ActionError(error.message);
    }

    if (!data.user) {
      throw new ActionError(AUTH_ERROR_MESSAGES.ACCOUNT_CREATION_FAILED);
    }
  });

export const signOutAction = action.inputSchema(z.object({})).action(async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new ActionError(error.message);
  }

  revalidatePath(routes.home, 'layout');
  redirect(routes.home);
});

export const updateProfileAction = authAction
  .inputSchema(updateProfileSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);

    const result = await updateProfile(profile.id, parsedInput);

    if (!result.success) {
      throw new ActionError(result.error || AUTH_ERROR_MESSAGES.UPDATE_FAILED);
    }

    await CacheClient.invalidateUserProfile(user.id);
    revalidatePath(routes.settings.root, 'page');
    return { profile: result.data, message: AUTH_SUCCESS_MESSAGES.PROFILE_UPDATED };
  });

export const uploadAvatarAction = authAction
  .inputSchema(uploadAvatarSchema)
  .action(async ({ parsedInput: { file }, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);

    if (file.size > AVATAR_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new ActionError(AUTH_ERROR_MESSAGES.FILE_TOO_LARGE);
    }
    if (!AVATAR_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
      throw new ActionError(AUTH_ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    const uploadResult = await uploadAvatarFile(profile.id, file, {
      bucket: AVATAR_UPLOAD_CONFIG.STORAGE_BUCKET,
      cacheControl: AVATAR_UPLOAD_CONFIG.CACHE_CONTROL,
      upsert: false,
    });

    if (uploadResult.error) {
      throw new ActionError(uploadResult.error || AUTH_ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const updateResult = await updateProfileAvatar(profile.id, uploadResult.url!);

    if (!updateResult.success) {
      throw new ActionError(updateResult.error || AUTH_ERROR_MESSAGES.UPDATE_AVATAR_FAILED);
    }

    revalidatePath(routes.settings.root, 'page');
    await CacheClient.invalidateUserProfile(user.id);
    return { url: uploadResult.url, message: AUTH_SUCCESS_MESSAGES.AVATAR_UPLOADED };
  });
