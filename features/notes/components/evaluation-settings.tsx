import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Brain, Sparkles } from 'lucide-react';
import { AIModelSelector } from './ai-model-selector';
import { AIProvider } from '@/types';

type IEvaluationSettingsProps = {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onEvaluate: () => void;
  onReset?: () => void;
  isEvaluating: boolean;
  showReset?: boolean;
};

export const EvaluationSettings = ({
  provider,
  model,
  onProviderChange,
  onModelChange,
  onEvaluate,
  onReset,
  isEvaluating,
  showReset = false,
}: IEvaluationSettingsProps) => {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIModelSelector
          provider={provider}
          model={model}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          disabled={isEvaluating}
        />
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onEvaluate}
            disabled={isEvaluating}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isEvaluating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
          {showReset && onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              disabled={isEvaluating}
              className="hover:bg-gray-50"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
