import { createClient } from "@/lib/supabase/server";

import { IVideo, IVideoData } from "../types";
import { checkProfile } from "@/lib/require-auth";

export const getUserVideos = async (userId: string): Promise<IVideo[]> => {
  const supabase = await createClient();
  const { data: videos, error } = await supabase
    .from("videos")
    .select("*, notes(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user videos: ${error.message}`);
  }

  return videos;
};

export const searchUserVideos = async (
  userId: string,
  searchQuery?: string | null,
): Promise<IVideo[]> => {
  const supabase = await createClient();
  let query = supabase
    .from("videos")
    .select("*, notes(count)")
    .eq("user_id", userId);

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: videos, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(`Failed to search videos: ${error.message}`);
  }

  return videos;
};

export const getLearnPageData = async (searchQuery?: string | null) => {
  const profile = await checkProfile();
  const videosPromise = searchQuery
    ? searchUserVideos(profile.id, searchQuery)
    : getUserVideos(profile.id);
  return videosPromise;
};

export const checkExistingVideo = async (userId: string, youtubeId: string) => {
  const supabase = await createClient();
  const { data: existingVideos, error } = await supabase
    .from("videos")
    .select("id")
    .eq("youtube_id", youtubeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to check existing video: ${error.message}`);
  }

  return existingVideos;
};

export const insertVideo = async (videoData: IVideoData) => {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").insert({
    user_id: videoData.userId,
    youtube_id: videoData.youtubeId,
    title: videoData.title,
    description: videoData.description,
    thumbnail_url: videoData.thumbnailUrl,
    duration: videoData.duration,
    channel_name: videoData.channelName,
    published_at: videoData.publishedAt,
    tutorial: videoData.tutorial,
  });

  if (error) {
    throw new Error(`Failed to insert video: ${error.message}`);
  }

  return { success: true, videoId: videoData.youtubeId };
};

export const getVideoByYoutubeId = async (
  youtubeId: string,
  userId: string,
) => {
  const supabase = await createClient();
  const { data: video, error } = await supabase
    .from("videos")
    .select("*, courses(title)")
    .eq("youtube_id", youtubeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return video;
};

export const getVideoPageData = async (videoId: string) => {
  const profile = await checkProfile();

  const video = await getVideoByYoutubeId(videoId, profile.id);

  return video;
};

export const getVideoById = async (videoId: string, userId: string) => {
  const supabase = await createClient();
  const { data: video, error } = await supabase
    .from("videos")
    .select("id, title, youtube_id, description, tutorial")
    .eq("id", videoId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return video;
};
