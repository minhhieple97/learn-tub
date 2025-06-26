import { EvaluationSettings } from "./evaluation-settings";
import { EvaluationError } from "./evaluation-error";
import { EvaluationWelcome } from "./evaluation-welcome";
import { NoteEvaluationStreaming } from "./note-evaluation-streaming";
import { NoteFeedbackDisplay } from "./note-feedback-display";
import { STATUS_STREAMING } from "@/config/constants";
import { useNotesStore } from "../store";

type IEvaluationContentProps = {
  provider: string | null;
  aiModelId: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (modelId: string) => void;
  onEvaluate: () => Promise<void>;
};

export const EvaluationContent = ({
  provider,
  aiModelId,
  onProviderChange,
  onModelChange,
  onEvaluate,
}: IEvaluationContentProps) => {
  const {
    evaluation,
    resetEvaluation,
    showEvaluationSettings,
    adjustEvaluationSettings,
  } = useNotesStore();

  return (
    <div className="space-y-6">
      {evaluation.showSettings && (
        <EvaluationSettings
          provider={provider}
          aiModelId={aiModelId}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          onEvaluate={onEvaluate}
          onReset={resetEvaluation}
          isEvaluating={evaluation.isEvaluating}
          showReset={evaluation.isCompleted || evaluation.hasError}
        />
      )}

      {evaluation.hasError && (
        <EvaluationError
          error={evaluation.error || ""}
          onAdjustSettings={adjustEvaluationSettings}
        />
      )}

      {(evaluation.isEvaluating || evaluation.streamingContent) && (
        <NoteEvaluationStreaming
          content={evaluation.streamingContent}
          isEvaluating={evaluation.isEvaluating}
        />
      )}

      {evaluation.feedback && evaluation.isCompleted && (
        <NoteFeedbackDisplay
          feedback={evaluation.feedback}
          onReset={resetEvaluation}
        />
      )}

      {evaluation.status === STATUS_STREAMING.IDLE &&
        !evaluation.showSettings && (
          <EvaluationWelcome onStartAnalysis={showEvaluationSettings} />
        )}
    </div>
  );
};
