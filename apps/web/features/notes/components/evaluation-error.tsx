import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Settings } from 'lucide-react';

type IEvaluationErrorProps = {
  error: string;
  onAdjustSettings: () => void;
};

export const EvaluationError = ({ error, onAdjustSettings }: IEvaluationErrorProps) => {
  return (
    <Card className="border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-4">
          <div className="h-9 w-9 bg-destructive/10 dark:bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-medium text-destructive-foreground">Analysis Failed</h4>
            <p className="text-sm text-destructive-foreground/80">{error}</p>
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onAdjustSettings}
                className="border-destructive/20 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                Adjust Settings
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
