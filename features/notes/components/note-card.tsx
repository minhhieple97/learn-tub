import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimestampDisplay } from './timestamp-display';
import { NoteCardActions } from './note-card-actions';
import { useNotesStore } from '../store';
import type { INote } from '../types';
import { NoteEvaluation } from '@/features/notes/components/note-evaluation';

type NoteCardProps = {
  note: INote;
  onTimestampClick?: (timestamp: number) => void;
};

export const NoteCard = ({ note, onTimestampClick }: NoteCardProps) => {
  const { startEditing } = useNotesStore((state) => state);
  const { deleteNote } = useNotesStore((state) => state);

  const handleEdit = () => startEditing(note);
  const handleDelete = () => deleteNote(note.id);
  const handleTimestampClick = (timestamp: number) =>
    onTimestampClick?.(timestamp);

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted px-4 py-2 flex justify-between items-center">
        <TimestampDisplay
          timestamp={note.timestamp_seconds}
          onClick={handleTimestampClick}
          clickable={!!onTimestampClick}
        />
        <div className="flex items-center gap-2">
          <NoteEvaluation noteId={note.id} />
          <NoteCardActions
            onEdit={handleEdit}
            onDelete={handleDelete}
            noteId={note.id}
          />
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
  );
};
