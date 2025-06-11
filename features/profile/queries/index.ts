import { createClient } from '@/lib/supabase/server';

export const getProfileInSession = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user');
  }
  const profile = await getProfileByUserId(user.id);
  return profile;
};

export const getProfileByUserId = async (userId: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) {
    throw new Error('Profile not found');
  }
  return profile;
};
