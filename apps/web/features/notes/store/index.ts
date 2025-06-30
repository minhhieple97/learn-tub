"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import {
  TOAST_MESSAGES,
  AI_API,
  CHUNK_TYPES,
  ERROR_MESSAGES,
  STATUS_STREAMING,
} from '@/config/constants';
import type { INote } from "../types";
import { toast } from "@/hooks/use-toast";
import { IFeedback } from "@/types";
import { INoteEvaluationStatus } from "../types";

type NotesState = {
  notes: INote[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: INote[];
  isSearching: boolean;
  isSearchActive: boolean;
  resultCount: number;
  formContent: string;
  formTags: string[];
  tagInput: string;
  editingNote: INote | null;
  isFormLoading: boolean;
  currentVideoId: string | null;
  currentTimestamp: number;

  // Evaluation state
  evaluation: {
    isOpen: boolean;
    showSettings: boolean;
    activeTab: string;
    provider: string | null;
    aiModelId: string;
    currentNoteId: string | null;
    status: INoteEvaluationStatus;
    feedback: IFeedback | null;
    streamingContent: string;
    error: string | null;
    isEvaluating: boolean;
    isCompleted: boolean;
    hasError: boolean;
  };

  setCurrentVideo: (videoId: string) => void;
  setCurrentTimestamp: (timestamp: number) => void;
  loadNotes: (videoId: string) => Promise<void>;
  saveNote: (
    content: string,
    tags: string[],
    timestamp: number,
  ) => Promise<void>;
  updateNote: (
    noteId: string,
    content: string,
    tags: string[],
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  performSearch: (query?: string) => Promise<void>;
  clearSearch: () => void;
  setFormContent: (content: string) => void;
  setFormTags: (tags: string[]) => void;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  startEditing: (note: INote) => void;
  cancelEditing: () => void;
  resetForm: () => void;
  getDisplayNotes: () => INote[];
  getSearchResultCount: () => number;

  openEvaluation: (noteId: string) => void;
  closeEvaluation: () => void;
  setShowSettings: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setProvider: (provider: string) => void;
  setAiModelId: (modelId: string) => void;
  evaluateNote: (noteId: string, aiModelId: string) => Promise<void>;
  resetEvaluation: () => void;
  toggleSettings: () => void;
  showEvaluationSettings: () => void;
  adjustEvaluationSettings: () => void;
};

export const useNotesStore = create<NotesState>()(
  devtools(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      searchQuery: "",
      searchResults: [],
      isSearching: false,
      isSearchActive: false,
      resultCount: 0,
      formContent: "",
      formTags: [],
      tagInput: "",
      editingNote: null,
      isFormLoading: false,
      currentVideoId: null,
      currentTimestamp: 0,

      // Evaluation initial state
      evaluation: {
        isOpen: false,
        showSettings: false,
        activeTab: "evaluate",
        provider: null,
        aiModelId: "",
        currentNoteId: null,
        status: STATUS_STREAMING.IDLE,
        feedback: null,
        streamingContent: "",
        error: null,
        isEvaluating: false,
        isCompleted: false,
        hasError: false,
      },

      setCurrentVideo: (videoId: string) => {
        set({ currentVideoId: videoId });
        get().loadNotes(videoId);
      },

      setCurrentTimestamp: (timestamp: number) => {
        set({ currentTimestamp: timestamp });
      },

      loadNotes: async (videoId: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { data: user } = await supabase.auth.getUser();

          if (!user.user) {
            throw new Error("User not authenticated");
          }

          const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("video_id", videoId)
            .eq("user_id", user.user.id)
            .order("updated_at", { ascending: false });

          if (error) throw error;

          set({ notes: data || [], isLoading: false });
        } catch (error) {
          console.error("Error loading notes:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to load notes",
            isLoading: false,
          });
        }
      },

      saveNote: async (content: string, tags: string[], timestamp: number) => {
        const { currentVideoId } = get();
        if (!currentVideoId || !content.trim()) return;

        set({ isFormLoading: true });

        try {
          const supabase = createClient();
          const { data: user } = await supabase.auth.getUser();

          if (!user.user) {
            throw new Error("User not authenticated");
          }

          const { error } = await supabase.from("notes").insert({
            video_id: currentVideoId,
            user_id: user.user.id,
            content: content.trim(),
            timestamp_seconds: timestamp,
            tags: tags.length > 0 ? tags : null,
          });

          if (error) throw error;

          await get().loadNotes(currentVideoId);
          get().resetForm();

          toast.success({
            description: TOAST_MESSAGES.NOTE_SAVED_SUCCESS,
          });
        } catch (error) {
          console.error("Error saving note:", error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_SAVE_ERROR,
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      updateNote: async (noteId: string, content: string, tags: string[]) => {
        set({ isFormLoading: true });
        const { currentVideoId } = get();
        if (!currentVideoId) return;

        try {
          const supabase = createClient();
          const { error } = await supabase
            .from("notes")
            .update({
              content: content.trim(),
              tags: tags.length > 0 ? tags : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", noteId);

          if (error) throw error;

          await get().loadNotes(currentVideoId);

          get().resetForm();

          toast.success({
            description: TOAST_MESSAGES.NOTE_UPDATED_SUCCESS,
          });
        } catch (error) {
          console.error("Error updating note:", error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_UPDATE_ERROR,
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      deleteNote: async (noteId: string) => {
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from("notes")
            .delete()
            .eq("id", noteId);

          if (error) throw error;

          set((state) => ({
            notes: state.notes.filter((note) => note.id !== noteId),
            searchResults: state.searchResults.filter(
              (note) => note.id !== noteId,
            ),
          }));

          toast.success({
            description: TOAST_MESSAGES.NOTE_DELETED_SUCCESS,
          });
        } catch (error) {
          console.error("Error deleting note:", error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_DELETE_ERROR,
          });
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        if (query.trim()) {
          get().performSearch();
        } else {
          set({ searchResults: [], isSearchActive: false });
        }
      },

      performSearch: async (query?: string) => {
        const { searchQuery: storeQuery, currentVideoId } = get();
        const searchQuery = query || storeQuery;
        if (!currentVideoId) return;

        const hasQuery = searchQuery.trim();

        if (!hasQuery) {
          set({ searchResults: [], isSearchActive: false });
          return;
        }

        set({ isSearching: true, searchQuery });

        try {
          const supabase = createClient();
          const dataUser = await supabase.auth.getUser();
          const user = dataUser.data.user;
          if (!user) return;
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (!profile) return;
          let queryBuilder = supabase
            .from("notes")
            .select("*")
            .eq("video_id", currentVideoId)
            .eq("user_id", profile.id);

          if (hasQuery) {
            queryBuilder = queryBuilder.ilike(
              "content",
              `%${searchQuery.trim()}%`,
            );
          }

          const { data, error } = await queryBuilder.order("created_at", {
            ascending: false,
          });

          if (error) throw error;

          set({
            searchResults: data || [],
            isSearchActive: true,
            isSearching: false,
            resultCount: data?.length || 0,
          });
        } catch (error) {
          console.error("Error performing search:", error);
          set({
            searchResults: [],
            isSearchActive: false,
            isSearching: false,
          });
        }
      },

      clearSearch: () => {
        set({
          searchQuery: "",
          searchResults: [],
          isSearchActive: false,
          isSearching: false,
          resultCount: 0,
        });
      },

      setFormContent: (content: string) => {
        set({ formContent: content });
      },

      setFormTags: (tags: string[]) => {
        set({ formTags: tags });
      },

      setTagInput: (input: string) => {
        set({ tagInput: input });
      },

      addTag: () => {
        const { tagInput, formTags } = get();

        if (tagInput && !formTags.includes(tagInput)) {
          set({
            formTags: [...formTags, tagInput],
            tagInput: "",
          });
        }
      },

      removeTag: (tag: string) => {
        set((state) => ({
          formTags: state.formTags.filter((t) => t !== tag),
        }));
      },

      startEditing: (note: INote) => {
        set({
          editingNote: note,
          formContent: note.content,
          formTags: note.tags || [],
          tagInput: "",
        });
      },

      cancelEditing: () => {
        get().resetForm();
      },

      resetForm: () => {
        set({
          formContent: "",
          formTags: [],
          tagInput: "",
          editingNote: null,
        });
      },

      getDisplayNotes: () => {
        const { notes, searchResults, isSearchActive } = get();
        return isSearchActive ? searchResults : notes;
      },

      getSearchResultCount: () => {
        const { searchResults } = get();
        return searchResults.length;
      },

      // Evaluation methods
      openEvaluation: (noteId: string) => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            isOpen: true,
            currentNoteId: noteId,
            showSettings: state.evaluation.status === STATUS_STREAMING.IDLE,
          },
        }));
      },

      closeEvaluation: () => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            isOpen: false,
            currentNoteId: null,
          },
        }));
      },

      setShowSettings: (show: boolean) => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            showSettings: show,
          },
        }));
      },

      setActiveTab: (tab: string) => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            activeTab: tab,
            showSettings:
              tab === "evaluate" &&
              state.evaluation.status === STATUS_STREAMING.IDLE,
          },
        }));
      },

      setProvider: (provider: string) => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            provider,
          },
        }));
      },

      setAiModelId: (modelId: string) => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            aiModelId: modelId,
          },
        }));
      },

      evaluateNote: async (noteId: string, aiModelId: string) => {
        try {
          set((state) => ({
            evaluation: {
              ...state.evaluation,
              status: STATUS_STREAMING.EVALUATING,
              error: null,
              feedback: null,
              streamingContent: "",
              isEvaluating: true,
              isCompleted: false,
              hasError: false,
              showSettings: false,
            },
          }));

          const streamUrl = `${AI_API.EVALUATE_NOTE_PATH}?noteId=${noteId}&aiModelId=${aiModelId}`;

          const response = await fetch(streamUrl);

          if (!response.ok) {
            throw new Error(
              `${ERROR_MESSAGES.FAILED_TO_EVALUATE_NOTE}: ${response.statusText}`,
            );
          }

          if (!response.body) {
            throw new Error(ERROR_MESSAGES.NO_RESPONSE_BODY);
          }

          set((state) => ({
            evaluation: {
              ...state.evaluation,
              status: STATUS_STREAMING.STREAMING,
            },
          }));

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                try {
                  const chunk = JSON.parse(
                    line.slice(AI_API.SSE_DATA_PREFIX_LENGTH),
                  );

                  if (chunk.type === CHUNK_TYPES.FEEDBACK) {
                    set((state) => ({
                      evaluation: {
                        ...state.evaluation,
                        streamingContent:
                          state.evaluation.streamingContent + chunk.content,
                      },
                    }));
                  } else if (chunk.type === CHUNK_TYPES.COMPLETE) {
                    const completeFeedback: IFeedback = JSON.parse(
                      chunk.content,
                    );
                    set((state) => ({
                      evaluation: {
                        ...state.evaluation,
                        feedback: completeFeedback,
                        status: STATUS_STREAMING.COMPLETED,
                        streamingContent: "",
                        isEvaluating: false,
                        isCompleted: true,
                      },
                    }));
                  } else if (chunk.type === CHUNK_TYPES.ERROR) {
                    set((state) => ({
                      evaluation: {
                        ...state.evaluation,
                        error: chunk.content,
                        status: STATUS_STREAMING.ERROR,
                        streamingContent: "",
                        isEvaluating: false,
                        hasError: true,
                      },
                    }));
                  }
                } catch (parseError) {
                  console.error(
                    ERROR_MESSAGES.FAILED_TO_PARSE_CHUNK,
                    parseError,
                  );
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
          const errorMessage =
            err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR;
          set((state) => ({
            evaluation: {
              ...state.evaluation,
              error: errorMessage,
              status: STATUS_STREAMING.ERROR,
              streamingContent: "",
              isEvaluating: false,
              hasError: true,
            },
          }));
        }
      },

      resetEvaluation: () => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            status: STATUS_STREAMING.IDLE,
            feedback: null,
            streamingContent: "",
            error: null,
            isEvaluating: false,
            isCompleted: false,
            hasError: false,
            showSettings: false,
          },
        }));
      },

      toggleSettings: () => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            showSettings: !state.evaluation.showSettings,
          },
        }));
      },

      showEvaluationSettings: () => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            showSettings: true,
          },
        }));
      },

      adjustEvaluationSettings: () => {
        set((state) => ({
          evaluation: {
            ...state.evaluation,
            status: STATUS_STREAMING.IDLE,
            feedback: null,
            streamingContent: "",
            error: null,
            isEvaluating: false,
            isCompleted: false,
            hasError: false,
            showSettings: true,
          },
        }));
      },
    }),
    {
      name: "notes-store",
    },
  ),
);
