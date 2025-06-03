'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Note, CreateNotePayload, UpdateNotePayload } from '../types';

type UseNotesProps = {
  videoId: string;
  currentTimestamp: number;
};

type UseNotesReturn = {
  // State
  notes: Note[];
  content: string;
  tagInput: string;
  tags: string[];
  isLoading: boolean;
  editingNoteId: string | null;
  dbVideoId: string | null;

  // Actions
  setContent: (content: string) => void;
  setTagInput: (tagInput: string) => void;
  setTags: (tags: string[]) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleSaveNote: () => Promise<void>;
  handleEditNote: (note: Note) => void;
  handleDeleteNote: (noteId: string) => Promise<void>;
  handleCancelEdit: () => void;
  formatTimestamp: (seconds: number) => string;
};

export const useNotes = ({ videoId, currentTimestamp }: UseNotesProps): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [dbVideoId, setDbVideoId] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  // Fetch video ID from database
  const fetchVideoId = useCallback(async () => {
    try {
      const { data: videos } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', videoId)
        .limit(1);

      if (videos && videos.length > 0) {
        setDbVideoId(videos[0].id);
      }
    } catch (error) {
      console.error('Error fetching video ID:', error);
    }
  }, [videoId, supabase]);

  // Fetch notes from database
  const fetchNotes = useCallback(async () => {
    if (!dbVideoId) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('video_id', dbVideoId)
        .eq('user_id', user.user.id)
        .order('timestamp_seconds', { ascending: true });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [dbVideoId, supabase]);

  // Initialize data
  useEffect(() => {
    fetchVideoId();
  }, [fetchVideoId]);

  useEffect(() => {
    if (!dbVideoId) return;

    fetchNotes();

    // Set up real-time subscription
    const notesSubscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `video_id=eq.${dbVideoId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [...prev, payload.new as Note]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) =>
              prev.map((note) => (note.id === payload.new.id ? (payload.new as Note) : note)),
            );
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((note) => note.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
    };
  }, [dbVideoId, fetchNotes, supabase]);

  // Tag management
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setTags(tags.filter((t) => t !== tag));
    },
    [tags],
  );

  // Note CRUD operations
  const handleSaveNote = useCallback(async () => {
    if (!content.trim() || !dbVideoId) return;

    setIsLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to save notes',
          variant: 'destructive',
        });
        return;
      }

      if (editingNoteId) {
        // Update existing note
        const updatePayload: UpdateNotePayload = {
          content,
          tags,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('notes')
          .update(updatePayload)
          .eq('id', editingNoteId);

        if (error) throw error;

        toast({
          title: 'Note Updated',
          description: 'Your note has been updated successfully',
        });

        setEditingNoteId(null);
      } else {
        // Create new note
        const createPayload: CreateNotePayload = {
          video_id: dbVideoId,
          user_id: user.user.id,
          content,
          timestamp_seconds: currentTimestamp,
          tags,
        };

        const { error } = await supabase.from('notes').insert(createPayload);

        if (error) throw error;

        toast({
          title: 'Note Saved',
          description: 'Your note has been saved successfully',
        });
      }

      // Reset form
      setContent('');
      setTags([]);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [content, dbVideoId, editingNoteId, tags, currentTimestamp, supabase, toast]);

  const handleEditNote = useCallback((note: Note) => {
    setContent(note.content);
    setTags(note.tags || []);
    setEditingNoteId(note.id);
  }, []);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);

        if (error) throw error;

        toast({
          title: 'Note Deleted',
          description: 'Your note has been deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting note:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete note. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [supabase, toast],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingNoteId(null);
    setContent('');
    setTags([]);
  }, []);

  // Utility functions
  const formatTimestamp = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  return {
    // State
    notes,
    content,
    tagInput,
    tags,
    isLoading,
    editingNoteId,
    dbVideoId,

    // Actions
    setContent,
    setTagInput,
    setTags,
    handleAddTag,
    handleRemoveTag,
    handleSaveNote,
    handleEditNote,
    handleDeleteNote,
    handleCancelEdit,
    formatTimestamp,
  };
};
