import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Settings } from 'lucide-react';

type IEvaluationDialogHeaderProps = {
  showSettingsButton: boolean;
  onToggleSettings: () => void;
};

export const EvaluationDialogHeader = ({
  showSettingsButton,
  onToggleSettings,
}: IEvaluationDialogHeaderProps) => {
  return (
    <DialogHeader className="border-b pb-4">
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span>AI Note Evaluation</span>
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </div>
        {showSettingsButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSettings}
            className="h-8 w-8 p-0 hover:scale-105 transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
