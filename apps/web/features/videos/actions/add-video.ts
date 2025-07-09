"use server";

import { authAction, ActionError } from "@/lib/safe-action";
import { checkExistingVideo, insertVideo } from "../queries";

import { addVideoSchema } from "../schemas";
import {
  fetchYouTubeVideoData,
  parseDuration,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/utils";
import { VIDEO_DEFAULTS, TOAST_MESSAGES } from "@/config/constants";
import { RateLimiter } from "@/lib/rate-limiter";

export const addVideoAction = authAction
  .inputSchema(addVideoSchema)
  .action(async ({ parsedInput: { videoUrl, tutorial }, ctx: { user } }) => {
    try {
      const rateLimitResult = await RateLimiter.checkRateLimit(user.id);

      if (!rateLimitResult.allowed) {
        throw new ActionError(
          `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
        );
      }
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        throw new ActionError(TOAST_MESSAGES.INVALID_URL_ERROR);
      }

      const videoExists = await checkExistingVideo(user.id, videoId);
      if (videoExists) {
        throw new ActionError(TOAST_MESSAGES.VIDEO_EXISTS_ERROR);
      }

      const videoData = await fetchYouTubeVideoData(videoId);

      if (!videoData) {
        throw new ActionError(TOAST_MESSAGES.VIDEO_NOT_FOUND_ERROR);
      }

      const result = await insertVideo({
        userId: user.id,
        youtubeId: videoId,
        title: videoData?.snippet?.title || VIDEO_DEFAULTS.TITLE,
        description:
          videoData?.snippet?.description || VIDEO_DEFAULTS.DESCRIPTION,
        thumbnailUrl:
          videoData?.snippet?.thumbnails?.high?.url ||
          getYouTubeThumbnailUrl(videoId),
        duration: videoData?.contentDetails?.duration
          ? parseDuration(videoData.contentDetails.duration)
          : VIDEO_DEFAULTS.DURATION,
        channelName:
          videoData?.snippet?.channelTitle || VIDEO_DEFAULTS.CHANNEL_NAME,
        publishedAt: videoData?.snippet?.publishedAt || null,
        tutorial: tutorial || null,
      });

      return result;
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      console.error("Unexpected error:", error);
      throw new ActionError(TOAST_MESSAGES.UNEXPECTED_ERROR);
    }
  });
