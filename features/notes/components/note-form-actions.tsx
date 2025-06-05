import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { NoteFormActionsProps } from '../types';
import { Spinner } from '@/components/ui/spinner';

export const NoteFormActions = ({
  isLoading,
  isEditing,
  onSave,
  onCancel,
  disabled = false,
}: NoteFormActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={isLoading || disabled} className="flex-1">
        {isLoading ? (
          <Spinner size="small" className="mr-2 h-4 w-4" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {isEditing ? 'Update Note' : 'Save Note'}
      </Button>

      {isEditing && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
};
