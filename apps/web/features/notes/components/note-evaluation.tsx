import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, History } from "lucide-react";
import { STATUS_STREAMING } from "@/config/constants";
import { EvaluationDialogHeader } from "./evaluation-dialog-header";
import { EvaluationContent } from "./evaluation-content";
import { AIFeedbackHistory } from "./note-feedback-history";
import { useNotesStore } from "../store";
import { useAIModelData } from "@/features/ai/hooks/use-ai-models";
import type { IAIModelOption } from "@/features/ai/types";

type INoteEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

export const NoteEvaluation = ({ noteId, disabled }: INoteEvaluationProps) => {
  const { data } = useAIModelData();
  const providers = data?.providers || [];
  const modelOptions = data?.modelOptions || [];

  const {
    evaluation,
    openEvaluation,
    closeEvaluation,
    setActiveTab,
    setProvider,
    setAiModelId,
    evaluateNote,
    toggleSettings,
  } = useNotesStore();

  useEffect(() => {
    if (
      providers.length > 0 &&
      !providers.some((p) => p.name === evaluation.provider)
    ) {
      setProvider(providers[0]?.name || "");
    }
  }, [providers, evaluation.provider, setProvider]);

  useEffect(() => {
    if (!evaluation.aiModelId && modelOptions.length > 0) {
      const providerModel = modelOptions.find(
        (opt: IAIModelOption) => opt.provider_name === evaluation.provider,
      );
      if (providerModel) {
        setAiModelId(providerModel.ai_model_id);
      }
    }
  }, [evaluation.provider, evaluation.aiModelId, modelOptions, setAiModelId]);

  const handleEvaluate = async () => {
    if (!evaluation.aiModelId) return;
    await evaluateNote(noteId, evaluation.aiModelId);
  };

  const handleOpenDialog = () => {
    openEvaluation(noteId);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      closeEvaluation();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerModel = modelOptions.find(
      (opt: IAIModelOption) => opt.provider_name === newProvider,
    );
    if (providerModel) {
      setAiModelId(providerModel.ai_model_id);
    }
  };

  const handleModelChange = (newModelId: string) => {
    setAiModelId(newModelId);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleOpenDialog}
        className="h-8 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
      >
        <Brain className="h-4 w-4 mr-1" />
        Analyze
      </Button>

      <Dialog open={evaluation.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent
          className="max-w-3xl overflow-hidden"
          style={{
            maxHeight: "90vh",
          }}
        >
          <EvaluationDialogHeader
            showSettingsButton={evaluation.isCompleted || evaluation.hasError}
            onToggleSettings={toggleSettings}
          />

          <div className="overflow-y-auto flex-1 py-4 pb-6">
            <Tabs
              value={evaluation.activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="evaluate"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  New Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="evaluate" className="space-y-6">
                <EvaluationContent
                  provider={evaluation.provider}
                  aiModelId={evaluation.aiModelId}
                  onProviderChange={handleProviderChange}
                  onModelChange={handleModelChange}
                  onEvaluate={handleEvaluate}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-6 pb-4">
                <AIFeedbackHistory noteId={noteId} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
