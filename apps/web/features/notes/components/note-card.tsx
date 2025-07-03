import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimestampDisplay } from "./timestamp-display";
import { NoteCardActions } from "./note-card-actions";
import type { INote } from "../types";
import { NoteEvaluation } from "@/features/notes/components/note-evaluation";
import { RichContentRenderer } from "./rich-content-renderer";
import { useNotesStore } from "../store";

type NoteCardProps = {
  note: INote;
};

export const NoteCard = ({ note }: NoteCardProps) => {
  const { handleNoteTimestampClick } = useNotesStore((state) => state);
  const handleTimestampClick = (timestamp: number) =>
    handleNoteTimestampClick(timestamp);

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted px-4 py-2 flex justify-between items-center">
        <TimestampDisplay
          timestamp={note.timestamp_seconds}
          onClick={handleTimestampClick}
          clickable={true}
        />
        <div className="flex items-center gap-2">
          <NoteEvaluation noteId={note.id} />
          <NoteCardActions noteId={note.id} note={note} />
        </div>
      </div>
      <CardContent className="p-4">
        <RichContentRenderer
          content={note.content}
          maxImageWidth={150}
          showFullImages={false}
        />
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
