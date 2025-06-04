"use server"

import { authAction, ActionError } from '@/lib/safe-action';
import { checkExistingVideo, insertVideo } from '../queries';
import { getProfile } from '@/features/profile/queries/profile';
import { addVideoSchema } from '../schemas';
import { 
  fetchYouTubeVideoData, 
  parseDuration, 
  extractYouTubeId, 
  getYouTubeThumbnailUrl 
} from '@/lib/utils';
import { VIDEO_DEFAULTS, TOAST_MESSAGES } from '@/config/constants';

export const addVideoAction = authAction
  .inputSchema(addVideoSchema)
  .action(async ({ parsedInput: { videoUrl }, ctx: { user } }) => {
    try {
      const profile = await getProfile();
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        throw new ActionError(TOAST_MESSAGES.INVALID_URL_ERROR);
      }

      const videoExists = await checkExistingVideo(profile.id, videoId);
      if (videoExists) {
        throw new ActionError(TOAST_MESSAGES.VIDEO_EXISTS_ERROR);
      }

      const videoData = await fetchYouTubeVideoData(videoId);

      const result = await insertVideo({
        userId: profile.id,
        youtubeId: videoId,
        title: videoData?.snippet?.title || VIDEO_DEFAULTS.TITLE,
        description: videoData?.snippet?.description || VIDEO_DEFAULTS.DESCRIPTION,
        thumbnailUrl: videoData?.snippet?.thumbnails?.high?.url || getYouTubeThumbnailUrl(videoId),
        duration: videoData?.contentDetails?.duration
          ? parseDuration(videoData.contentDetails.duration)
          : VIDEO_DEFAULTS.DURATION,
        channelName: videoData?.snippet?.channelTitle || VIDEO_DEFAULTS.CHANNEL_NAME,
        publishedAt: videoData?.snippet?.publishedAt || null,
      });

      return result;
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      console.error('Unexpected error:', error);
      throw new ActionError(TOAST_MESSAGES.UNEXPECTED_ERROR);
    }
  });
