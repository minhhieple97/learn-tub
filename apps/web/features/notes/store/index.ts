"use client";

import { create } from "zustand";
import { devtools } from 'zustand/middleware';
import {
  TOAST_MESSAGES,
  AI_API,
  CHUNK_TYPES,
  ERROR_MESSAGES,
  STATUS_STREAMING,
} from '@/config/constants';
import type { INote } from '../types';
import { toast } from '@/hooks/use-toast';
import { IFeedback } from '@/types';
import { INoteEvaluationStatus } from '../types';
import { saveNoteAction, updateNoteAction, deleteNoteAction } from '../actions';
import { JSONContent } from '@tiptap/react';

type NotesState = {
  // Form state
  formContent: JSONContent;
  formTags: string[];
  tagInput: string;
  editingNote: INote | null;
  isFormLoading: boolean;
  currentVideoId: string;
  currentTimestamp: number;
  searchQuery: string;

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
  saveNote: (content: JSONContent, tags: string[], timestamp: number) => Promise<void>;
  updateNote: (noteId: string, content: JSONContent, tags: string[]) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setFormContent: (content: JSONContent) => void;
  setFormTags: (tags: string[]) => void;
  setTagInput: (input: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  startEditing: (note: INote) => void;
  cancelEditing: () => void;
  resetForm: () => void;

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
      // Form state
      formContent: '',
      formTags: [],
      tagInput: '',
      editingNote: null,
      isFormLoading: false,
      currentVideoId: '',
      currentTimestamp: 0,
      searchQuery: '',

      // Evaluation initial state
      evaluation: {
        isOpen: false,
        showSettings: false,
        activeTab: 'evaluate',
        provider: null,
        aiModelId: '',
        currentNoteId: null,
        status: STATUS_STREAMING.IDLE,
        feedback: null,
        streamingContent: '',
        error: null,
        isEvaluating: false,
        isCompleted: false,
        hasError: false,
      },

      setCurrentVideo: (videoId: string) => {
        set({ currentVideoId: videoId });
      },

      setCurrentTimestamp: (timestamp: number) => {
        set({ currentTimestamp: timestamp });
      },

      saveNote: async (content: JSONContent, tags: string[], timestamp: number) => {
        const { currentVideoId } = get();
        if (!currentVideoId) return;
        set({ isFormLoading: true });
        try {
          const result = await saveNoteAction({
            videoId: currentVideoId,
            content,
            timestamp,
            tags: tags.length > 0 ? tags : [],
          });

          if (result?.data?.success) {
            get().resetForm();
            // Note: Query invalidation will be handled by the component using useInvalidateNotes
            toast.success({
              description: TOAST_MESSAGES.NOTE_SAVED_SUCCESS,
            });
          } else {
            throw new Error(result?.data?.message || 'Failed to save note');
          }
        } catch (error) {
          console.error('Error saving note:', error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_SAVE_ERROR,
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      updateNote: async (noteId: string, content: JSONContent, tags: string[]) => {
        set({ isFormLoading: true });

        try {
          const result = await updateNoteAction({
            noteId,
            content: content.trim(),
            tags: tags.length > 0 ? tags : [],
          });

          if (result?.data?.success) {
            get().resetForm();
            toast.success({
              description: TOAST_MESSAGES.NOTE_UPDATED_SUCCESS,
            });
          } else {
            throw new Error(result?.data?.message || 'Failed to update note');
          }
        } catch (error) {
          console.error('Error updating note:', error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_UPDATE_ERROR,
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      deleteNote: async (noteId: string) => {
        try {
          const result = await deleteNoteAction({
            noteId,
          });

          if (result?.data?.success) {
            toast.success({
              description: TOAST_MESSAGES.NOTE_DELETED_SUCCESS,
            });
          } else {
            throw new Error(result?.data?.message || 'Failed to delete note');
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          toast.error({
            description: TOAST_MESSAGES.NOTE_DELETE_ERROR,
          });
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      clearSearch: () => {
        set({
          searchQuery: '',
        });
      },

      setFormContent: (content: JSONContent) => {
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
            tagInput: '',
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
          formContent: note.content || {},
          formTags: note.tags || [],
          tagInput: '',
        });
      },

      cancelEditing: () => {
        get().resetForm();
      },

      resetForm: () => {
        set({
          formContent: {},
          formTags: [],
          tagInput: '',
          editingNote: null,
        });
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
            showSettings: tab === 'evaluate' && state.evaluation.status === STATUS_STREAMING.IDLE,
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
              streamingContent: '',
              isEvaluating: true,
              isCompleted: false,
              hasError: false,
              showSettings: false,
            },
          }));

          const streamUrl = `${AI_API.EVALUATE_NOTE_PATH}?noteId=${noteId}&aiModelId=${aiModelId}`;

          const response = await fetch(streamUrl);

          if (!response.ok) {
            throw new Error(`${ERROR_MESSAGES.FAILED_TO_EVALUATE_NOTE}: ${response.statusText}`);
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
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
                try {
                  const chunk = JSON.parse(line.slice(AI_API.SSE_DATA_PREFIX_LENGTH));

                  if (chunk.type === CHUNK_TYPES.FEEDBACK) {
                    set((state) => ({
                      evaluation: {
                        ...state.evaluation,
                        streamingContent: state.evaluation.streamingContent + chunk.content,
                      },
                    }));
                  } else if (chunk.type === CHUNK_TYPES.COMPLETE) {
                    const completeFeedback: IFeedback = JSON.parse(chunk.content);
                    set((state) => ({
                      evaluation: {
                        ...state.evaluation,
                        feedback: completeFeedback,
                        status: STATUS_STREAMING.COMPLETED,
                        streamingContent: '',
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
                        streamingContent: '',
                        isEvaluating: false,
                        hasError: true,
                      },
                    }));
                  }
                } catch (parseError) {
                  console.error(ERROR_MESSAGES.FAILED_TO_PARSE_CHUNK, parseError);
                }
              }
            }
          }
        } catch (err) {
          console.log(err);
          const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR;
          set((state) => ({
            evaluation: {
              ...state.evaluation,
              error: errorMessage,
              status: STATUS_STREAMING.ERROR,
              streamingContent: '',
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
            streamingContent: '',
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
            streamingContent: '',
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
      name: 'notes-store',
    },
  ),
);
