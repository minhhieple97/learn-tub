import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from './supabase/server';
import { routes } from '@/routes';

export const getUserInSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(routes.login);
  }
  return user;
});

export const getProfileInSession = cache(async () => {
  const supabase = await createClient();
  const user = await getUserInSession();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!data || error) {
    redirect(routes.login);
  }
  return data;
});

export const getProfileByUserId = async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!data || error) {
    redirect(routes.login);
  }
  return data;
};
