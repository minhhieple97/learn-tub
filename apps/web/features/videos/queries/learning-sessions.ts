import { createClient } from "@/lib/supabase/server";
import { checkProfile } from "@/lib/require-auth";
import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

type LearningSession = Tables<"learning_sessions">;
type LearningSessionInsert = TablesInsert<"learning_sessions">;
type LearningSessionUpdate = TablesUpdate<"learning_sessions">;

export const getLearningSessionByVideoId = async (
  videoId: string,
  userId: string,
): Promise<LearningSession | null> => {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get learning session: ${error.message}`);
  }

  return session;
};

export const createLearningSession = async (
  sessionData: LearningSessionInsert,
): Promise<LearningSession> => {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("learning_sessions")
    .insert({
      ...sessionData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create learning session: ${error.message}`);
  }

  return session;
};

export const updateLearningSession = async (
  sessionId: string,
  updates: LearningSessionUpdate,
): Promise<LearningSession> => {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("learning_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update learning session: ${error.message}`);
  }

  return session;
};

export const updateLearningSessionByVideoId = async (
  videoId: string,
  userId: string,
  updates: LearningSessionUpdate,
): Promise<LearningSession> => {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("learning_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update learning session: ${error.message}`);
  }

  return session;
};

export const getUserLearningSessions = async (
  userId: string,
  limit = 50,
): Promise<LearningSession[]> => {
  const supabase = await createClient();
  const { data: sessions, error } = await supabase
    .from("learning_sessions")
    .select("*, videos(title, thumbnail_url, youtube_id)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get user learning sessions: ${error.message}`);
  }

  return sessions;
};

export const getRecentLearningSessions = async () => {
  const profile = await checkProfile();
  return getUserLearningSessions(profile.id, 10);
};
