/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { INote } from "../types";
import { Json } from "@/database.types";
import { INoteEvaluationResult } from "@/features/quizzes/types";
import {
  MEDIA_UPLOAD,
  MEDIA_SOURCES,
  FileType,
  FILE_TYPES,
} from "../constants";
import { formatTimestamp } from "@/lib/utils";
import { JSONContent } from "@tiptap/react";

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
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }

  return (data || []) as INote[];
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

  return data as INote;
}

export async function getNoteForEvaluation(noteId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select(
      `
      content, 
      timestamp_seconds,
      videos!inner(
        title,
        description
      )
    `,
    )
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

  return (data || []) as INote[];
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
    .or(`content_text.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching notes:", error);
    throw new Error(`Failed to search notes: ${error.message}`);
  }

  return (data || []) as INote[];
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

export const getMediaFileById = async (mediaFileId: string, userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_files")
    .select("*")
    .eq("id", mediaFileId)
    .eq("user_id", userId)
    .single();

  return { data, error };
};

export const linkMediaToNote = async (
  noteId: string,
  mediaFileId: string,
  position?: number,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("note_media")
    .insert({
      note_id: noteId,
      media_file_id: mediaFileId,
      position_in_content: position,
    })
    .select("*")
    .single();

  return { data, error };
};

export const getNoteMediaByNoteId = async (noteId: string, userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("note_media")
    .select(
      `
      *,
      media_files!inner(*)
    `,
    )
    .eq("note_id", noteId)
    .eq("media_files.user_id", userId)
    .order("position_in_content", { ascending: true });

  return { data, error };
};

export const unlinkMediaFromNote = async (
  noteId: string,
  mediaFileId: string,
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("note_media")
    .delete()
    .eq("note_id", noteId)
    .eq("media_file_id", mediaFileId);

  return { error };
};

export const uploadFileToStorage = async (
  file: File,
  userId: string,
  fileName: string,
): Promise<{ data: any; error: any; storagePath: string }> => {
  const supabase = await createClient();
  const storagePath = `${MEDIA_UPLOAD.PATH_PREFIX}/${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(MEDIA_UPLOAD.STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: MEDIA_UPLOAD.CACHE_CONTROL,
      upsert: false,
    });

  return { data, error, storagePath };
};

export const getPublicUrl = async (storagePath: string) => {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(MEDIA_UPLOAD.STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data;
};

export const createMediaFile = async ({
  userId,
  fileName,
  fileType,
  fileSize,
  mimeType,
  storagePath,
  publicUrl,
  width,
  height,
  source = MEDIA_SOURCES.USER_UPLOAD,
}: {
  userId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  publicUrl: string;
  width?: number | null;
  height?: number | null;
  source?: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media_files")
    .insert({
      user_id: userId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      mime_type: mimeType,
      storage_path: storagePath,
      public_url: publicUrl,
      width,
      height,
      metadata: {
        source,
        uploaded_at: new Date().toISOString(),
      },
    })
    .select("*")
    .single();

  return { data, error };
};

export const createVideoScreenshot = async ({
  mediaFileId,
  videoId,
  userId,
  timestampSeconds,
  youtubeTimestamp,
  videoTitle,
}: {
  mediaFileId: string;
  videoId: string;
  userId: string;
  timestampSeconds: number;
  youtubeTimestamp: string;
  videoTitle?: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("video_screenshots")
    .insert({
      media_file_id: mediaFileId,
      video_id: videoId,
      user_id: userId,
      timestamp_seconds: timestampSeconds,
      youtube_timestamp: youtubeTimestamp,
      video_title: videoTitle,
    })
    .select("*")
    .single();

  return { data, error };
};

export const cleanupStorageFile = async (
  storagePath: string,
): Promise<{ error: any }> => {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(MEDIA_UPLOAD.STORAGE_BUCKET)
    .remove([storagePath]);

  return { error };
};

export const uploadScreenshotToStorage = async (
  file: File,
  userId: string,
): Promise<{ data: any; error: any; storagePath: string }> => {
  const supabase = await createClient();
  const fileName = `screenshots/${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(MEDIA_UPLOAD.STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: MEDIA_UPLOAD.CACHE_CONTROL,
      upsert: false,
    });

  return { data, error, storagePath: fileName };
};

export const getScreenshotPublicUrl = async (storagePath: string) => {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(MEDIA_UPLOAD.STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data;
};

export const saveScreenshotMetadata = async ({
  userId,
  videoId,
  fileName,
  fileSize,
  width,
  height,
  timestamp,
  publicUrl,
  storagePath,
  videoTitle,
}: {
  userId: string;
  videoId: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  timestamp: number;
  publicUrl: string;
  storagePath: string;
  videoTitle?: string;
}) => {
  const supabase = await createClient();

  // Create media file record
  const { data: mediaFile, error: mediaError } = await supabase
    .from("media_files")
    .insert({
      user_id: userId,
      file_name: fileName,
      file_type: FILE_TYPES.VIDEO_SCREENSHOT,
      file_size: fileSize,
      mime_type: "image/png",
      storage_path: storagePath,
      public_url: publicUrl,
      width,
      height,
      metadata: {
        source: MEDIA_SOURCES.YOUTUBE_VIDEO,
        captured_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (mediaError) {
    return { data: null, error: mediaError };
  }

  // Create video screenshot record
  const { data: screenshot, error: screenshotError } = await supabase
    .from("video_screenshots")
    .insert({
      media_file_id: mediaFile.id,
      video_id: videoId,
      user_id: userId,
      timestamp_seconds: timestamp,
      youtube_timestamp: formatTimestamp(timestamp),
      video_title: videoTitle,
    })
    .select("*")
    .single();

  if (screenshotError) {
    return { data: null, error: screenshotError };
  }

  return {
    data: {
      mediaFileId: mediaFile.id,
      screenshotId: screenshot.id,
      publicUrl,
    },
    error: null,
  };
};

export const linkScreenshotToNote = async (
  noteId: string,
  mediaFileId: string,
  position?: number,
) => {
  const supabase = await createClient();

  const { error } = await supabase.from("note_media").insert({
    note_id: noteId,
    media_file_id: mediaFileId,
    position_in_content: position,
  });

  return { error };
};

export const deleteImageFromStorage = async (
  imageUrl: string,
  storagePath: string,
  userId: string,
): Promise<{ error: any }> => {
  const supabase = await createClient();

  try {
    // First, find the media file record by URL
    const { data: mediaFile, error: findError } = await supabase
      .from("media_files")
      .select("id, storage_path")
      .eq("public_url", imageUrl)
      .eq("user_id", userId)
      .single();

    if (findError && findError.code !== "PGRST116") {
      return { error: findError };
    }

    // If we found a media file record, delete related records first
    if (mediaFile) {
      // Delete from note_media links
      await supabase
        .from("note_media")
        .delete()
        .eq("media_file_id", mediaFile.id);

      // Delete from video_screenshots if exists
      await supabase
        .from("video_screenshots")
        .delete()
        .eq("media_file_id", mediaFile.id);

      // Delete the media file record
      await supabase.from("media_files").delete().eq("id", mediaFile.id);

      // Use the storage path from the database record
      storagePath = mediaFile.storage_path;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(MEDIA_UPLOAD.STORAGE_BUCKET)
      .remove([storagePath]);

    return { error: storageError };
  } catch (error) {
    return { error };
  }
};

export const createNote = async ({
  videoId,
  userId,
  content,
  timestamp,
  tags,
}: {
  videoId: string;
  userId: string;
  content: JSONContent;
  timestamp: number;
  tags: string[];
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      video_id: videoId,
      user_id: userId,
      content,
      timestamp_seconds: timestamp,
      tags,
    })
    .select("id")
    .single();

  return { data, error };
};

export const updateNote = async ({
  noteId,
  userId,
  content,
  tags,
}: {
  noteId: string;
  userId: string;
  content: JSONContent;
  tags: string[];
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notes")
    .update({
      content,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("user_id", userId);

  return { error };
};

export const deleteNote = async ({
  noteId,
  userId,
}: {
  noteId: string;
  userId: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  return { error };
};
