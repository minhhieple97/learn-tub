"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Save, Plus, X } from "lucide-react"

interface NoteEditorProps {
  videoId: string;
  currentTimestamp: number;
  onTimestampClick?: (time: number) => void;
}

interface Note {
  id: string;
  content: string;
  timestamp_seconds: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function NoteEditor({ videoId, currentTimestamp, onTimestampClick }: NoteEditorProps) {
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
  useEffect(() => {
    const fetchVideoId = async () => {
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
    };

    fetchVideoId();
  }, [videoId]);

  // Fetch notes when dbVideoId is available
  useEffect(() => {
    if (!dbVideoId) return;

    const fetchNotes = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('video_id', dbVideoId)
          .eq('user_id', user.user.id)
          .order('timestamp_seconds', { ascending: true });

        if (error) {
          throw error;
        }

        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

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
  }, [dbVideoId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSaveNote = async () => {
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
        const { error } = await supabase
          .from('notes')
          .update({
            content,
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNoteId);

        if (error) throw error;

        toast({
          title: 'Note Updated',
          description: 'Your note has been updated successfully',
        });

        setEditingNoteId(null);
      } else {
        // Create new note
        const { error } = await supabase.from('notes').insert({
          video_id: dbVideoId,
          user_id: user.user.id,
          content,
          timestamp_seconds: currentTimestamp,
          tags,
        });

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
  };

  const handleEditNote = (note: Note) => {
    setContent(note.content);
    setTags(note.tags || []);
    setEditingNoteId(note.id);
  };

  const handleDeleteNote = async (noteId: string) => {
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
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Take Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Current Time: {formatTimestamp(currentTimestamp)}</span>
          </div>
          <Textarea
            placeholder="Write your notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSaveNote} disabled={isLoading} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {editingNoteId ? 'Update Note' : 'Save Note'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Your Notes</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No notes yet. Start taking notes to see them here.
          </p>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <div className="bg-muted px-4 py-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span
                    className={`text-sm font-medium ${
                      onTimestampClick ? 'cursor-pointer hover:text-blue-600' : ''
                    }`}
                    onClick={() => onTimestampClick?.(note.timestamp_seconds)}
                  >
                    {formatTimestamp(note.timestamp_seconds)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap">{note.content}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
