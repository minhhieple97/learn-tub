import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Settings } from "lucide-react";

type IEvaluationDialogHeaderProps = {
  showSettingsButton: boolean;
  onToggleSettings: () => void;
};

export const EvaluationDialogHeader = ({
  showSettingsButton,
  onToggleSettings,
}: IEvaluationDialogHeaderProps) => {
  return (
    <DialogHeader className="border-b border-border/20 pb-5 px-6 pt-6 bg-gradient-to-r from-slate-50/50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/30">
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
              AI Note Evaluation
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0 font-medium px-2 py-0.5"
              >
                Beta
              </Badge>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                AI-powered analysis
              </span>
            </div>
          </div>
        </div>
        {showSettingsButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSettings}
            className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors rounded-md"
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
