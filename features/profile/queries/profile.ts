import { createClient } from '@/lib/supabase/server';

export const getProfile = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile || profileError) {
    throw new Error('Profile not found');
  }
  return profile;
};
