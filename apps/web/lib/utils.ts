import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env.mjs";
import {
  YOUTUBE_API,
  YOUTUBE_PATTERNS,
  VIDEO_DEFAULTS,
  AI_EVALUATION,
} from "@/config/constants";
import { IFeedback, IYouTubeVideo } from "@/types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, label: "" };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return { strength, label: labels[strength - 1] || "" };
};

export const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 1) return "bg-red-500";
  if (strength <= 2) return "bg-yellow-500";
  if (strength <= 3) return "bg-blue-500";
  return "bg-green-500";
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return YOUTUBE_PATTERNS.VALID_URL_REGEX.test(url);
};

export const dotPatternUrl =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

// Format duration from seconds to MM:SS or HH:MM:SS
export const formatDuration = (seconds: number): string => {
  if (!seconds) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};


export const formatHoursMinutes = (seconds: number): string => {
  if (!seconds) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  }

  return `${minutes}m`;
};


export const formatChange = (
  current: number,
  previous: number,
  unit?: string,
): string => {
  if (previous === 0) {
    return current > 0
      ? `+${current}${unit || ""} from last week`
      : "No change";
  }

  const change = current - previous;
  const sign = change >= 0 ? "+" : "";

  if (unit) {
    return `${sign}${change}${unit} from last week`;
  }

  return `${sign}${change} from last week`;
};

export const formatTimeChange = (
  currentSeconds: number,
  previousSeconds: number,
): string => {
  const changeSeconds = currentSeconds - previousSeconds;

  if (changeSeconds === 0) {
    return "No change";
  }

  const sign = changeSeconds >= 0 ? "+" : "";
  const changeFormatted = formatHoursMinutes(Math.abs(changeSeconds));

  return `${sign}${changeFormatted} from last week`;
};

export const formatStreakChange = (
  currentStreak: number,
  previousStreak: number,
): string => {
  if (currentStreak === 0) {
    return "Start your streak!";
  }

  if (currentStreak > previousStreak) {
    return "Keep it up!";
  }

  if (currentStreak === previousStreak) {
    return "Maintain the streak!";
  }

  return "Rebuild your streak!";
};

export const formatTimestamp = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const fetchYouTubeVideoData = async (
  videoId: string,
): Promise<IYouTubeVideo | null> => {
  const apiKey = env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API.BASE_URL}?id=${videoId}&key=${apiKey}&part=${YOUTUBE_API.PARTS}`,
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }
  } catch (error) {
    console.error("YouTube API error:", error);
  }

  return null;
};

export const parseDuration = (duration: string): number => {
  const match = duration.match(YOUTUBE_PATTERNS.DURATION_REGEX);
  if (!match) return VIDEO_DEFAULTS.DURATION;

  const hours = Number.parseInt(match[1] || "0");
  const minutes = Number.parseInt(match[2] || "0");
  const seconds = Number.parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
};

export const extractYouTubeId = (url: string): string | null => {
  const match = url.match(YOUTUBE_PATTERNS.URL_REGEX);
  return match ? match[1] || null : null;
};

export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `${YOUTUBE_API.THUMBNAIL_URL}/${videoId}/hqdefault.jpg`;
};

export const formatFeedbackForCopy = (feedback: IFeedback): string => {
  return `AI Evaluation Feedback

Summary: ${feedback.summary}

Overall Score: ${feedback.overall_score}/10

Correct Points:
${feedback.correct_points.map((point) => `• ${point}`).join("\n")}

Points to Review:
${feedback.incorrect_points.map((point) => `• ${point}`).join("\n")}

Improvement Suggestions:
${feedback.improvement_suggestions.map((suggestion) => `• ${suggestion}`).join("\n")}

Detailed Analysis:
${feedback.detailed_analysis}`;
};

export const getScoreColor = (score: number) => {
  if (score >= AI_EVALUATION.SCORE_EXCELLENT_THRESHOLD) return "bg-green-500";
  if (score >= AI_EVALUATION.SCORE_GOOD_THRESHOLD) return "bg-yellow-500";
  return "bg-red-500";
};
