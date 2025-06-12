'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { action, ActionError } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '../schemas';
import { routes } from '@/routes';
import { z } from 'zod';

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
      throw new ActionError('Failed to create user account');
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
