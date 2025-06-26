"use server";

import { createClient } from "@/lib/supabase/server";
import { INote } from "../types";
import { Json } from "@/database.types";
import { INoteEvaluationResult } from "@/features/quizzes/types";

export async function getNotesByVideoId(
  videoId: string,
  userId: string,
): Promise<INote[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .order("timestamp_seconds", { ascending: true });

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }

  return data || [];
}

export async function getNoteById(
  noteId: string,
  userId: string,
): Promise<INote | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("Error fetching note:", error);
    throw new Error(`Failed to fetch note: ${error.message}`);
  }

  return data;
}

export async function getNoteForEvaluation(noteId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("content, timestamp_seconds")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function getAIModelName(aiModelId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_model_pricing_view")
    .select("model_name")
    .eq("id", aiModelId)
    .single();

  return { data, error };
}

export async function getUserNotes(
  userId: string,
  limit?: number,
): Promise<INote[]> {
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select(
      `
      *,
      videos!inner(title, youtube_id)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user notes:", error);
    throw new Error(`Failed to fetch user notes: ${error.message}`);
  }

  return data || [];
}

export const searchNotes = async (
  userId: string,
  searchTerm: string,
): Promise<INote[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      *,
      videos!inner(title, youtube_id)
    `,
    )
    .eq("user_id", userId)
    .or(`content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching notes:", error);
    throw new Error(`Failed to search notes: ${error.message}`);
  }

  return data || [];
};

export const createNoteInteraction = async (
  userId: string,
  noteId: string,
  aiModelId: string,
  feedback: Json,
): Promise<{ id: string }> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_interactions")
    .insert({
      user_id: userId,
      note_id: noteId,
      ai_model_id: aiModelId,
      output_data: feedback,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save AI interaction: ${error.message}`);
  }

  return { id: data.id };
};

export const getNoteInteractionsByNoteId = async (
  noteId: string,
  userId: string,
): Promise<INoteEvaluationResult[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("note_interactions")
    .select(
      `
      *,
      ai_model_pricing_view!inner(
        model_name,
        provider_name,
        provider_display_name
      )
    `,
    )
    .eq("note_id", noteId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch AI interactions: ${error.message}`);
  }

  return data.map((interaction) => ({
    id: interaction.id,
    note_id: interaction.note_id || "",
    user_id: interaction.user_id,
    provider: interaction.ai_model_pricing_view?.provider_name,
    model: interaction.ai_model_pricing_view?.model_name || "",
    feedback: interaction.output_data,
    created_at: interaction.created_at || "",
  }));
};

export const getLatestAIEvaluation = async (
  noteId: string,
  userId: string,
): Promise<INoteEvaluationResult | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("note_interactions")
    .select(
      `
      *,
      ai_model_pricing_view!inner(
        model_name,
        provider_name,
        provider_display_name
      )
    `,
    )
    .eq("note_id", noteId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    note_id: data.note_id || "",
    user_id: data.user_id,
    provider: data.ai_model_pricing_view?.provider_name,
    model: data.ai_model_pricing_view?.model_name || "",
    feedback: data.output_data as any,
    created_at: data.created_at || "",
  };
};
