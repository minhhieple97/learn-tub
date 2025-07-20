import { memo } from "react";

export const EmptyState = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
      <div className="text-4xl mb-4">🗺️</div>
      <h3 className="text-lg font-semibold mb-2">No roadmaps to visualize</h3>
      <p className="text-sm">
        Create your first roadmap to see it here as a mindmap.
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";
