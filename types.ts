import { AI_PROVIDERS, CHUNK_TYPES } from './config/constants';

export type AIProvider =
  | typeof AI_PROVIDERS.OPENAI
  | typeof AI_PROVIDERS.GEMINI;



export type StreamChunk = {
  type:
    | typeof CHUNK_TYPES.FEEDBACK
    | typeof CHUNK_TYPES.COMPLETE
    | typeof CHUNK_TYPES.ERROR;
  content: string;
  finished?: boolean;
};

export type IFeedback = {
  summary: string;
  correct_points: string[];
  incorrect_points: string[];
  improvement_suggestions: string[];
  overall_score: number;
  detailed_analysis: string;
};

export type IYouTubeVideo = {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  contentDetails: {
    duration: string;
  };
};
