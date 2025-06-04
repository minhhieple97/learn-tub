import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimestampDisplay } from './timestamp-display';
import { NoteActions } from './note-actions';
import type { NoteCardProps } from '../types';

export function NoteCard({ note, onTimestampClick, onEditNote, onDeleteNote }: NoteCardProps) {
  const handleEdit = () => onEditNote(note);
  const handleDelete = () => onDeleteNote(note.id);
  const handleTimestampClick = (timestamp: number) => onTimestampClick?.(timestamp);

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted px-4 py-2 flex justify-between items-center">
        <TimestampDisplay
          timestamp={note.timestamp_seconds}
          onClick={handleTimestampClick}
          clickable={!!onTimestampClick}
        />
        <NoteActions onEdit={handleEdit} onDelete={handleDelete} />
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
}
