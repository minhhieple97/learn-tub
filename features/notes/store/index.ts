'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { TOAST_MESSAGES } from '@/config/constants';
import type { Note } from '../types';

type ToastFn = (options: {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}) => void;



type NotesState = {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Note[];
  isSearching: boolean;
  isSearchActive: boolean;
  resultCount: number;
  formContent: string;
  formTags: string[];
  tagInput: string;
  editingNote: Note | null;
  isFormLoading: boolean;
  currentVideoId: string | null;
  currentTimestamp: number;
  setCurrentVideo: (videoId: string) => void;
  setCurrentTimestamp: (timestamp: number) => void;
  loadNotes: (videoId: string) => Promise<void>;
  saveNote: (content: string, tags: string[], timestamp: number, toast?: ToastFn) => Promise<void>;
  updateNote: (noteId: string, content: string, tags: string[], toast?: ToastFn) => Promise<void>;
  deleteNote: (noteId: string, toast?: ToastFn) => Promise<void>;
  setSearchQuery: (query: string) => void;
  performSearch: (query?: string) => Promise<void>;
  clearSearch: () => void;
  setFormContent: (content: string) => void;
  setFormTags: (tags: string[]) => void;
  setTagInput: (input: string) => void;
  addTag: (tag?: string) => void;
  removeTag: (tag: string) => void;
  startEditing: (note: Note) => void;
  cancelEditing: () => void;
  resetForm: () => void;
  getDisplayNotes: () => Note[];
  getSearchResultCount: () => number;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      isSearchActive: false,
      resultCount: 0,
      formContent: '',
      formTags: [],
      tagInput: '',
      editingNote: null,
      isFormLoading: false,
      currentVideoId: null,
      currentTimestamp: 0,

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
            throw new Error('User not authenticated');
          }

          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('video_id', videoId)
            .eq('user_id', user.user.id)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          set({ notes: data || [], isLoading: false });
        } catch (error) {
          console.error('Error loading notes:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load notes',
            isLoading: false 
          });
        }
      },

      saveNote: async (content: string, tags: string[], timestamp: number, toast?: ToastFn) => {
        const { currentVideoId } = get();
        if (!currentVideoId || !content.trim()) return;

        set({ isFormLoading: true });

        try {
          const supabase = createClient();
          const { data: user } = await supabase.auth.getUser();
          
          if (!user.user) {
            throw new Error('User not authenticated');
          }

          const { error } = await supabase
            .from('notes')
            .insert({
              video_id: currentVideoId,
              user_id: user.user.id,
              content: content.trim(),
              timestamp_seconds: timestamp,
              tags: tags.length > 0 ? tags : null,
            });

          if (error) throw error;

          await get().loadNotes(currentVideoId);
          get().resetForm();

          toast?.({
            title: 'Success',
            description: TOAST_MESSAGES.NOTE_SAVED_SUCCESS,
          });

        } catch (error) {
          console.error('Error saving note:', error);
          toast?.({
            title: 'Error',
            description: TOAST_MESSAGES.NOTE_SAVE_ERROR,
            variant: 'destructive',
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      updateNote: async (noteId: string, content: string, tags: string[], toast?: ToastFn) => {
        set({ isFormLoading: true });
        const { currentVideoId } = get();
        if (!currentVideoId) return;
        
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('notes')
            .update({
              content: content.trim(),
              tags: tags.length > 0 ? tags : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', noteId);

          if (error) throw error;

          await get().loadNotes(currentVideoId);

          get().resetForm();

          toast?.({
            title: 'Success',
            description: TOAST_MESSAGES.NOTE_UPDATED_SUCCESS,
          });

        } catch (error) {
          console.error('Error updating note:', error);
          toast?.({
            title: 'Error',
            description: TOAST_MESSAGES.NOTE_UPDATE_ERROR,
            variant: 'destructive',
          });
        } finally {
          set({ isFormLoading: false });
        }
      },

      deleteNote: async (noteId: string, toast?: ToastFn) => {
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

          if (error) throw error;

          set(state => ({
            notes: state.notes.filter(note => note.id !== noteId),
            searchResults: state.searchResults.filter(note => note.id !== noteId)
          }));

          toast?.({
            title: 'Success',
            description: TOAST_MESSAGES.NOTE_DELETED_SUCCESS,
          });

        } catch (error) {
          console.error('Error deleting note:', error);
          toast?.({
            title: 'Error',
            description: TOAST_MESSAGES.NOTE_DELETE_ERROR,
            variant: 'destructive',
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
          const { data: user } = await supabase.auth.getUser();
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.user?.id).single();
          if (!user.user || !profile) return;

          let queryBuilder = supabase
            .from('notes')
            .select('*')
            .eq('video_id', currentVideoId)
            .eq('user_id', profile.id);

          if (hasQuery) {
            queryBuilder = queryBuilder.ilike('content', `%${searchQuery.trim()}%`);
          }


          const { data, error } = await queryBuilder.order('created_at', { ascending: false });

          if (error) throw error;

          set({ 
            searchResults: data || [], 
            isSearchActive: true,
            isSearching: false,
            resultCount: data?.length || 0,
          });

        } catch (error) {
          console.error('Error performing search:', error);
          set({ 
            searchResults: [], 
            isSearchActive: false, 
            isSearching: false 
          });
        }
      },

      clearSearch: () => {
        set({
          searchQuery: '',
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

      addTag: (tag?: string) => {
        const { tagInput, formTags } = get();
        const newTag = (tag || tagInput).trim();
        
        if (newTag && !formTags.includes(newTag)) {
          set({ 
            formTags: [...formTags, newTag],
            tagInput: '' 
          });
        }
      },

      removeTag: (tag: string) => {
        set(state => ({
          formTags: state.formTags.filter(t => t !== tag)
        }));
      },

      startEditing: (note: Note) => {
        set({
          editingNote: note,
          formContent: note.content,
          formTags: note.tags || [],
          tagInput: '',
        });
      },

      cancelEditing: () => {
        get().resetForm();
      },

      resetForm: () => {
        set({
          formContent: '',
          formTags: [],
          tagInput: '',
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
    }),
    {
      name: 'notes-store',
    }
  )
);

