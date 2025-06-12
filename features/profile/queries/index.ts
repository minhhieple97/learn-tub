import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

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
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return profile;
});
