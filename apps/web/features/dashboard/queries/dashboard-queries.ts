import "server-only";
import { createClient } from "@/lib/supabase/server";

import { getQuizStatistics } from "@/features/quizzes/queries";
import type { IDashboardStats, IRecentVideo, ILearningGoal } from "../types";
import { checkProfile } from "@/lib/require-auth";
import {
  formatHoursMinutes,
  formatDistanceToNow,
  formatChange,
  formatTimeChange,
  formatStreakChange,
} from "@/lib/utils";

export const getDashboardStats = async (): Promise<IDashboardStats> => {
  const supabase = await createClient();
  const profile = await checkProfile();

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    { count: totalVideos },
    { count: totalNotes },
    { data: currentWeekSessions },
    { count: currentWeekVideos },
    { count: currentWeekNotes },
    { data: previousWeekSessions },
    { count: previousWeekVideos },
    { count: previousWeekNotes },
  ] = await Promise.all([
    supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),

    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),

    supabase
      .from("learning_sessions")
      .select("duration_seconds")
      .eq("user_id", profile.id)
      .gte("created_at", oneWeekAgo.toISOString()),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", oneWeekAgo.toISOString()),

    // Current week notes
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", oneWeekAgo.toISOString()),

    supabase
      .from("learning_sessions")
      .select("duration_seconds")
      .eq("user_id", profile.id)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString()),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString()),

    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString()),
  ]);

  const allSessions = await supabase
    .from("learning_sessions")
    .select("duration_seconds")
    .eq("user_id", profile.id);

  const totalLearningTimeSeconds =
    allSessions.data?.reduce(
      (total, session) => total + (session.duration_seconds || 0),
      0,
    ) || 0;

  const currentWeekLearningTime =
    currentWeekSessions?.reduce(
      (total, session) => total + (session.duration_seconds || 0),
      0,
    ) || 0;

  const previousWeekLearningTime =
    previousWeekSessions?.reduce(
      (total, session) => total + (session.duration_seconds || 0),
      0,
    ) || 0;

  const learningTime = formatHoursMinutes(totalLearningTimeSeconds);

  const streak = 7;
  const previousStreak = 5;

  const totalVideosChange = formatChange(
    currentWeekVideos || 0,
    previousWeekVideos || 0,
  );
  const learningTimeChange = formatTimeChange(
    currentWeekLearningTime,
    previousWeekLearningTime,
  );
  const notesCreatedChange = formatChange(
    currentWeekNotes || 0,
    previousWeekNotes || 0,
  );
  const streakChange = formatStreakChange(streak, previousStreak);

  return {
    totalVideos: totalVideos || 0,
    totalVideosChange,
    learningTime,
    learningTimeChange,
    notesCreated: totalNotes || 0,
    notesCreatedChange,
    streak,
    streakChange,
  };
};

export const getRecentVideos = async (): Promise<IRecentVideo[]> => {
  const supabase = await createClient();
  const profile = await checkProfile();

  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, title, thumbnail_url, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent videos:", error);
    return [];
  }

  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    timeAgo: formatDistanceToNow(new Date(video.created_at || "")),
    thumbnail: video.thumbnail_url || undefined,
  }));
};

export const getLearningGoals = async (): Promise<ILearningGoal[]> => {
  const supabase = await createClient();
  const profile = await checkProfile();

  const { count: videoCount, error: videoError } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  if (videoError) {
    console.error("Error fetching video count:", videoError);
  }

  const { count: notesCount, error: notesError } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  if (notesError) {
    console.error("Error fetching notes count:", notesError);
  }

  const videoTarget = 10;
  const notesTarget = 50;

  const videoPercentage = Math.min(
    Math.round(((videoCount || 0) / videoTarget) * 100),
    100,
  );
  const notesPercentage = Math.min(
    Math.round(((notesCount || 0) / notesTarget) * 100),
    100,
  );

  return [
    {
      id: "1",
      title: `Watch ${videoTarget} videos`,
      current: videoCount || 0,
      target: videoTarget,
      percentage: videoPercentage,
      color: "bg-blue-600",
    },
    {
      id: "2",
      title: `Take ${notesTarget} notes`,
      current: notesCount || 0,
      target: notesTarget,
      percentage: notesPercentage,
      color: "bg-green-600",
    },
  ];
};

export const getInsightsData = async () => {
  const supabase = await createClient();
  const profile = await checkProfile();

  const { count: analysisCount } = await supabase
    .from("note_interactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const quizStats = await getQuizStatistics(profile.id);

  const studyPlanCount = 0;

  return {
    analysisCount: analysisCount || 0,
    quizStats,
    studyPlanCount,
  };
};
