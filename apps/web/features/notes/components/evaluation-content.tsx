import { EvaluationSettings } from "./evaluation-settings";
import { EvaluationError } from "./evaluation-error";
import { EvaluationWelcome } from "./evaluation-welcome";
import { NoteEvaluationStreaming } from "./note-evaluation-streaming";
import { NoteFeedbackDisplay } from "./note-feedback-display";
import { STATUS_STREAMING } from "@/config/constants";
import { useNotesStore } from "../store";

export const EvaluationContent = () => {
  const {
    evaluation,
    resetEvaluation,
    showEvaluationSettings,
    adjustEvaluationSettings,
  } = useNotesStore();

  return (
    <div className="h-full flex flex-col space-y-6">
      {evaluation.showSettings && <EvaluationSettings />}

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
