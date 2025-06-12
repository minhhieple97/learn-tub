import { EvaluationSettings } from './evaluation-settings';
import { EvaluationError } from './evaluation-error';
import { EvaluationWelcome } from './evaluation-welcome';
import { NoteEvaluationStreaming } from './note-evaluation-streaming';
import { NoteFeedbackDisplay } from './note-feedback-display';
import { IFeedback, AIProvider } from '@/types';
import { STATUS_STREAMING } from '@/config/constants';

type IEvaluationContentProps = {
  // State
  showSettings: boolean;
  hasError: boolean;
  error: string;
  isEvaluating: boolean;
  isCompleted: boolean;
  streamingContent: string;
  feedback: IFeedback | null;
  status: string;

  // Configuration
  provider: AIProvider;
  model: string;

  // Handlers
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  onEvaluate: () => void;
  onReset: () => void;
  onShowSettings: () => void;
  onAdjustSettings: () => void;
};

export const EvaluationContent = ({
  showSettings,
  hasError,
  error,
  isEvaluating,
  isCompleted,
  streamingContent,
  feedback,
  status,
  provider,
  model,
  onProviderChange,
  onModelChange,
  onEvaluate,
  onReset,
  onShowSettings,
  onAdjustSettings,
}: IEvaluationContentProps) => {
  return (
    <div className="space-y-6">
      {showSettings && (
        <EvaluationSettings
          provider={provider}
          model={model}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          onEvaluate={onEvaluate}
          onReset={onReset}
          isEvaluating={isEvaluating}
          showReset={isCompleted || hasError}
        />
      )}

      {hasError && <EvaluationError error={error} onAdjustSettings={onAdjustSettings} />}

      {(isEvaluating || streamingContent) && (
        <NoteEvaluationStreaming content={streamingContent} isEvaluating={isEvaluating} />
      )}

      {feedback && isCompleted && <NoteFeedbackDisplay feedback={feedback} onReset={onReset} />}

      {status === STATUS_STREAMING.IDLE && !showSettings && (
        <EvaluationWelcome onStartAnalysis={onShowSettings} />
      )}
    </div>
  );
};
