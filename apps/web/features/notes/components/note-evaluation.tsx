import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, History, Loader2 } from "lucide-react";
import { EvaluationDialogHeader } from "./evaluation-dialog-header";
import { EvaluationContent } from "./evaluation-content";
import { AIFeedbackHistory } from "./note-feedback-history";
import { useNoteEvaluation } from "../hooks";

type INoteEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

export const NoteEvaluation = ({ noteId, disabled }: INoteEvaluationProps) => {
  const {
    isLoading,
    evaluation,
    handleOpenDialog,
    handleCloseDialog,
    handleTabChange,
    toggleSettings,
  } = useNoteEvaluation({ noteId, disabled });

  const renderAnalyzeButton = () => (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || isLoading}
      onClick={handleOpenDialog}
      className="h-8 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Brain className="h-4 w-4 mr-1" />
      )}
      {isLoading ? "Loading..." : "Analyze"}
    </Button>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-white animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Loading AI Models...
        </h3>
        <p className="text-sm text-gray-500">
          Please wait while we fetch the available AI models and providers.
        </p>
      </div>
    </div>
  );

  const renderTabs = () => (
    <Tabs
      value={evaluation.activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="evaluate" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          New Analysis
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="evaluate" className="space-y-6">
        <EvaluationContent />
      </TabsContent>

      <TabsContent value="history" className="space-y-6 pb-4">
        <AIFeedbackHistory noteId={noteId} />
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {renderAnalyzeButton()}

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
            {isLoading ? renderLoadingState() : renderTabs()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
