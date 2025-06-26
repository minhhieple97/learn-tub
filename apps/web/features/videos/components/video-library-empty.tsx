import { Video, Sparkles } from "lucide-react";

export const VideoLibraryEmpty = () => {
  return (
    <div className="text-center p-20 rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/30 shadow-2xl backdrop-blur-sm">
      <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/60 dark:to-indigo-900/60 shadow-2xl border border-blue-200/50 dark:border-blue-800/40">
        <Video className="h-14 w-14 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
        <Sparkles className="h-5 w-5" />
        <span className="font-semibold text-lg">
          Switch to "Add Video" tab to get started
        </span>
      </div>
    </div>
  );
};
