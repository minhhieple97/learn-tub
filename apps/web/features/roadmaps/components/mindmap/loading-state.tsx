import { memo } from "react";

type LoadingStateProps = {
  isGenerating?: boolean;
};

export const LoadingState = memo(({ isGenerating }: LoadingStateProps) => {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin text-4xl mb-4">🧠</div>
        <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Generating Your Learning Roadmap
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          AI is analyzing your request and finding the best YouTube videos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      Loading mindmap...
    </div>
  );
});

LoadingState.displayName = "LoadingState";
