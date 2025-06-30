# Notes Feature Usage Guide

## Overview

The notes feature has been updated to use React Query for better performance and state management. Here's how to use the new setup:

## Key Changes

### 1. Image Sizing
- Images in notes are now smaller (`max-w-xs` instead of `max-w-full`)
- Added hover effects for better user interaction

### 2. Image Deletion
- Click on an image to select it
- Press Delete or Backspace to remove selected images
- A delete button appears in the toolbar when an image is selected
- Visual feedback shows which image is selected

### 3. API-based Notes Management
- Notes operations now use API routes instead of direct Supabase calls
- Better error handling and loading states
- Automatic cache invalidation and updates

## Using React Query Hooks

### Basic Usage

```tsx
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/features/notes/queries-client';

// Get notes for a video
const { data: notes, isLoading, isError } = useNotes({ videoId: 'video-uuid' });

// Search notes
const { data: searchResults } = useNotes({ search: 'search term' });

// Get user notes with limit
const { data: recentNotes } = useNotes({ limit: 10 });
```

### Mutations

```tsx
const createNote = useCreateNote();
const updateNote = useUpdateNote();
const deleteNote = useDeleteNote();

// Create a note
await createNote.mutateAsync({
  videoId: 'video-uuid',
  content: 'Note content',
  timestamp: 120,
  tags: ['tag1', 'tag2']
});

// Update a note
await updateNote.mutateAsync({
  noteId: 'note-uuid',
  data: {
    content: 'Updated content',
    tags: ['new-tag']
  }
});

// Delete a note
await deleteNote.mutateAsync('note-uuid');
```

## Store Usage

The store is now focused on UI state and evaluation features:

```tsx
import { useNotesStore } from '@/features/notes/store';

const {
  // Form state
  formContent,
  formTags,
  tagInput,
  editingNoteId,
  
  // Actions
  setFormContent,
  startEditing,
  resetForm,
  
  // Search state
  searchQuery,
  setSearchQuery,
  
  // Evaluation state
  evaluation,
  openEvaluation,
} = useNotesStore();
```

## Rich Text Editor

The rich text editor now supports:

- Smaller image sizing by default
- Image selection and deletion via keyboard shortcuts
- Visual feedback for selected images
- Delete button in toolbar for selected images

```tsx
<RichTextEditor
  content={content}
  onContentChange={setContent}
  videoElement={videoElement}
  userId={userId}
  videoId={videoId}
  noteId={noteId}
  disabled={false}
/>
```

## API Routes

New API routes available:

- `GET /api/notes` - Get notes (with query params for filtering)
- `POST /api/notes` - Create a note
- `GET /api/notes/[id]` - Get a specific note
- `PUT /api/notes/[id]` - Update a note
- `DELETE /api/notes/[id]` - Delete a note

## Migration Guide

If you're updating existing components:

1. Replace direct Supabase calls with React Query hooks
2. Update imports to use `queries-client` instead of `queries`
3. Use the store only for UI state (form state, search, evaluation)
4. Handle loading and error states using React Query's built-in states

### Before (Old Way)
```tsx
const { notes, isLoading, loadNotes } = useNotesStore();

useEffect(() => {
  loadNotes(videoId);
}, [videoId]);
```

### After (New Way)
```tsx
const { data: notes, isLoading } = useNotes({ videoId });
```

## Example Component

See `NotesListWithQuery` component for a complete example of how to use all the new features together. 