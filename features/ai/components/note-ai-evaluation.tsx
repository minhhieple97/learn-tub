import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Brain, Settings } from 'lucide-react';
import { AI_CONFIG, AI_PROVIDERS } from '@/config/constants';
import { AIFeedbackDisplay } from './ai-feedback-display';
import { AIEvaluationStreaming } from './ai-evaluation-streaming';
import { AIModelSelector } from './ai-model-selector';
import { useAIEvaluation } from '../hooks';
import type { AIProvider } from '../types';

type NoteAIEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

export const NoteAIEvaluation = ({ noteId, disabled }: NoteAIEvaluationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIProvider>(AI_PROVIDERS.OPENAI);
  const [model, setModel] = useState<string>(AI_CONFIG.DEFAULT_MODEL);

  const {
    status,
    feedback,
    streamingContent,
    error,
    evaluateNote,
    reset,
    isEvaluating,
    isCompleted,
    hasError,
  } = useAIEvaluation();

  const handleEvaluate = async () => {
    setShowSettings(false);
    await evaluateNote(noteId, provider, model);
  };

  const handleReset = () => {
    reset();
    setShowSettings(false);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    if (status === 'idle') {
      setShowSettings(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleOpenDialog}
          className="h-8"
        >
          <Brain className="h-4 w-4 mr-1" />
          Analyze
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            AI Note Evaluation
            {(isCompleted || hasError) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Settings */}
          {showSettings && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-sm">AI Settings</h3>
              <AIModelSelector
                provider={provider}
                model={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
                disabled={isEvaluating}
              />
              <div className="flex gap-2">
                <Button onClick={handleEvaluate} disabled={isEvaluating} className="flex-1">
                  {isEvaluating ? 'Evaluating...' : 'Start Evaluation'}
                </Button>
                {(isCompleted || hasError) && (
                  <Button variant="outline" onClick={handleReset} disabled={isEvaluating}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {hasError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Evaluation Failed</h4>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Streaming Content */}
          {(isEvaluating || streamingContent) && (
            <AIEvaluationStreaming content={streamingContent} isEvaluating={isEvaluating} />
          )}

          {/* Final Feedback */}
          {feedback && isCompleted && (
            <AIFeedbackDisplay feedback={feedback} onReset={handleReset} />
          )}

          {/* Initial State */}
          {status === 'idle' && !showSettings && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">AI Note Evaluation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered feedback on your learning notes including accuracy, clarity, and
                improvement suggestions.
              </p>
              <Button onClick={() => setShowSettings(true)}>Start Evaluation</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
