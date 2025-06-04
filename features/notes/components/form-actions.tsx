import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { FormActionsProps } from '../types';

export const FormActions = ({ isLoading, isEditing, onSave, onCancel }: FormActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={isLoading} className="flex-1">
        <Save className="mr-2 h-4 w-4" />
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
