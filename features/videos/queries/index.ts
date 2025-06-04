import { createClient } from '@/lib/supabase/server';
import { Video } from '../types/video';
import { VideoData } from '../types/video-page';


export const getCurrentUser = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
  
  return user;
}

export const getUserProfile = async (userId: string) => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
  
  return profile;
}

export const getUserVideos = async (userId: string): Promise<Video[]> => {
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

export const getUserWithProfile = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    return { user: null, profile: null };
  }
  
  const profile = await getUserProfile(user.id);
  
  return { user, profile };
}

export const getLearnPageData = async () => {
  const { user, profile } = await getUserWithProfile();
  
  if (!user || !profile) {
    return { user: null, profile: null, videosPromise: null };
  }
  
  const videosPromise = getUserVideos(profile.id);
  
  return { user, profile, videosPromise };
}

export const checkExistingVideo = async (userId: string, youtubeId: string) => {
  const supabase = await createClient();
  const { data: existingVideos, error } = await supabase
    .from('videos')
    .select('id')
    .eq('youtube_id', youtubeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to check existing video: ${error.message}`);
  }

  return existingVideos;
}



export async function insertVideo(videoData: VideoData) {
  const supabase = await createClient();
  const { error } = await supabase.from('videos').insert({
    user_id: videoData.userId,
    youtube_id: videoData.youtubeId,
    title: videoData.title,
    description: videoData.description,
    thumbnail_url: videoData.thumbnailUrl,
    duration: videoData.duration,
    channel_name: videoData.channelName,
    published_at: videoData.publishedAt,
  });

  if (error) {
    throw new Error(`Failed to insert video: ${error.message}`);
  }

  return { success: true, videoId: videoData.youtubeId };
}

export const getVideoByYoutubeId = async (youtubeId: string, userId: string) => {
  const supabase = await createClient();
  const { data: video, error } = await supabase
    .from('videos')
    .select('*, courses(title)')
    .eq('youtube_id', youtubeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return video;
}

export const getVideoPageData = async (videoId: string) => {
  const { user, profile } = await getUserWithProfile();
  
  if (!user || !profile) {
    return { user: null, profile: null, video: null };
  }

  const video = await getVideoByYoutubeId(videoId, profile.id);
  
  return { user, profile, video };
}
