import type { Tables } from "@/database.types";

type LearningSession = Tables<"learning_sessions">;

type CreateSessionData = {
  video_id: string;
  duration_seconds?: number;
  progress_seconds?: number;
};

type UpdateSessionData = {
  video_id: string;
  duration_seconds?: number;
  progress_seconds?: number;
  completed?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export const getLearningSession = async (
  videoId: string,
): Promise<LearningSession | null> => {
  const response = await fetch(`/api/learning-sessions?videoId=${videoId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get learning session");
  }

  const result: ApiResponse<LearningSession | null> = await response.json();
  return result.data;
};

export const createOrUpdateSession = async (
  sessionData: CreateSessionData,
): Promise<LearningSession> => {
  const response = await fetch("/api/learning-sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    throw new Error("Failed to create/update learning session");
  }

  const result: ApiResponse<LearningSession> = await response.json();
  return result.data;
};

export const updateSessionProgress = async (
  updateData: UpdateSessionData,
): Promise<LearningSession> => {
  const response = await fetch("/api/learning-sessions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Failed to update learning session");
  }

  const result: ApiResponse<LearningSession> = await response.json();
  return result.data;
};

export const getUserSessions = async (
  limit?: number,
): Promise<LearningSession[]> => {
  const url = new URL("/api/learning-sessions", window.location.origin);
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user learning sessions");
  }

  const result: ApiResponse<LearningSession[]> = await response.json();
  return result.data;
};
