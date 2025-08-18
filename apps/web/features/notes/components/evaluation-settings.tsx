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
    <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-purple-50/40 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-purple-950/40 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <AIModelSelector
          provider={evaluation.provider}
          aiModelId={evaluation.aiModelId}
          onProviderChange={setProvider}
          onModelChange={setAiModelId}
          disabled={evaluation.isEvaluating}
        />
        <div className="flex gap-3 pt-3">
          <Button
            onClick={handleEvaluate}
            disabled={evaluation.isEvaluating}
            className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
              className="hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
