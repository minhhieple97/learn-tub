import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { INoteFormActionsProps } from '../types';
import { Spinner } from '@/components/ui/spinner';

export const NoteFormActions = ({
  isLoading,
  isEditing,
  onSave,
  onCancel,
  disabled = false,
}: INoteFormActionsProps) => {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onSave}
        disabled={isLoading || disabled}
        className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        {isLoading ? (
          <Spinner size="small" className="mr-2 h-4 w-4" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {isEditing ? 'Update Note' : 'Save Note'}
      </Button>

      {isEditing && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
