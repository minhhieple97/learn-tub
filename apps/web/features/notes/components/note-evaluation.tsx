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
      className="h-8 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-950/40 dark:to-purple-950/40 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 transition-colors text-sm font-medium"
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
      ) : (
        <Brain className="h-3.5 w-3.5 mr-2" />
      )}
      {isLoading ? "Loading..." : "Analyze"}
    </Button>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 px-4">
      <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
        <Loader2 className="h-6 w-6 text-white animate-spin" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Loading AI Models
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please wait while we initialize the AI evaluation engine.
        </p>
      </div>
    </div>
  );

  const renderTabs = () => (
    <Tabs value={evaluation.activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-10 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex-shrink-0">
        <TabsTrigger
          value="evaluate"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md text-xs font-medium px-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          New Analysis
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm rounded-md text-xs font-medium px-4"
        >
          <History className="h-3.5 w-3.5" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="evaluate" className="mt-0">
        <EvaluationContent />
      </TabsContent>

      <TabsContent value="history" className="mt-0">
        <AIFeedbackHistory noteId={noteId} />
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      {renderAnalyzeButton()}

      <Dialog open={evaluation.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent
          className="max-w-3xl p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col"
          style={{
            marginTop: '60px',
            marginBottom: '20px',
          }}
        >
          <EvaluationDialogHeader
            showSettingsButton={evaluation.isCompleted || evaluation.hasError}
            onToggleSettings={toggleSettings}
          />

          <div className="px-6 py-6">{isLoading ? renderLoadingState() : renderTabs()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
};
