export const learningSessionKeys = {
  all: ["learning-sessions"] as const,
  session: (videoId: string) => [...learningSessionKeys.all, videoId] as const,
  userSessions: (userId?: string) =>
    [...learningSessionKeys.all, "user", userId] as const,
  recent: () => [...learningSessionKeys.all, "recent"] as const,
} as const;
