'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { action, ActionError, authAction } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, updateProfileSchema, uploadAvatarSchema } from '../schemas';
import { AVATAR_UPLOAD_CONFIG, AUTH_ERROR_MESSAGES, AUTH_SUCCESS_MESSAGES } from '../constants';
import { routes } from '@/routes';
import { z } from 'zod';
import { getUserInSession } from '@/features/profile/queries';
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
    const supabase = await createClient();

    const profile = await checkProfileByUserId(user.id);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...parsedInput,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      throw new ActionError(error.message || AUTH_ERROR_MESSAGES.UPDATE_FAILED);
    }
    await CacheClient.invalidateUserProfile(user.id);
    revalidatePath(routes.settings.root, 'page');
    return { profile, message: AUTH_SUCCESS_MESSAGES.PROFILE_UPDATED };
  });

export const uploadAvatarAction = authAction
  .inputSchema(uploadAvatarSchema)
  .action(async ({ parsedInput: { file }, ctx: { user } }) => {
    const supabase = await createClient();
    const profile = await checkProfileByUserId(user.id);
    if (file.size > AVATAR_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new ActionError(AUTH_ERROR_MESSAGES.FILE_TOO_LARGE);
    }
    if (!AVATAR_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
      throw new ActionError(AUTH_ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
    const filePath = `${AVATAR_UPLOAD_CONFIG.STORAGE_BUCKET}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_UPLOAD_CONFIG.STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: AVATAR_UPLOAD_CONFIG.CACHE_CONTROL,
        upsert: false,
      });

    if (uploadError) {
      throw new ActionError(uploadError.message || AUTH_ERROR_MESSAGES.UPLOAD_FAILED);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_UPLOAD_CONFIG.STORAGE_BUCKET).getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      throw new ActionError(updateError.message || AUTH_ERROR_MESSAGES.UPDATE_AVATAR_FAILED);
    }

    revalidatePath(routes.settings.root, 'page');
    await CacheClient.invalidateUserProfile(user.id);
    return { url: publicUrl, message: AUTH_SUCCESS_MESSAGES.AVATAR_UPLOADED };
  });
