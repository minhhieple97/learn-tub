import { createClient } from '@/lib/supabase/server';
import { Video } from '../types/video';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
  
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
  
  return profile;
}

export async function getUserVideos(userId: string): Promise<Video[]> {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, notes(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user videos: ${error.message}`);
  }

  return videos || [];
}


export async function getUserWithProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    return { user: null, profile: null };
  }
  
  const profile = await getUserProfile(user.id);
  
  return { user, profile };
}


export async function getLearnPageData() {
  const { user, profile } = await getUserWithProfile();
  
  if (!user || !profile) {
    return { user: null, profile: null, videosPromise: null };
  }
  
  const videosPromise = getUserVideos(profile.id);
  
  return { user, profile, videosPromise };
}
