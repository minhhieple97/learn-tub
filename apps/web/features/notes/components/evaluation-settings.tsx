import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Brain, Sparkles } from "lucide-react";
import { AIModelSelector } from "../../ai/components/ai-model-selector";
import { useNotesStore } from "../store";

export const EvaluationSettings = () => {
  const {
    evaluation,
    setProvider,
    setAiModelId,
    evaluateNote,
    resetEvaluation,
  } = useNotesStore();

  const handleEvaluate = async () => {
    if (!evaluation.aiModelId || !evaluation.currentNoteId) return;
    await evaluateNote(evaluation.currentNoteId, evaluation.aiModelId);
  };

  const showReset = evaluation.isCompleted || evaluation.hasError;

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
          provider={evaluation.provider}
          aiModelId={evaluation.aiModelId}
          onProviderChange={setProvider}
          onModelChange={setAiModelId}
          disabled={evaluation.isEvaluating}
        />
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleEvaluate}
            disabled={evaluation.isEvaluating}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {evaluation.isEvaluating ? (
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
          {showReset && (
            <Button
              variant="outline"
              onClick={resetEvaluation}
              disabled={evaluation.isEvaluating}
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
