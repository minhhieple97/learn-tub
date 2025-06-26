import { Video } from "lucide-react";

type VideoLibraryErrorProps = {
  error: string;
};

export const VideoLibraryError = ({ error }: VideoLibraryErrorProps) => {
  return (
    <div className="text-center p-16 rounded-3xl bg-gradient-to-br from-red-50/90 via-pink-50/80 to-red-100/70 dark:from-red-950/40 dark:via-red-900/30 dark:to-red-950/20 border border-red-200/50 dark:border-red-800/30 shadow-2xl backdrop-blur-sm">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100/80 to-pink-100/80 dark:from-red-900/60 dark:to-pink-900/60 shadow-xl border border-red-200/50 dark:border-red-800/40">
        <Video className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-4">
        {error}
      </h3>
      <p className="text-red-700 dark:text-red-300 text-lg opacity-90 max-w-md mx-auto leading-relaxed">
        Please try again or contact support if the problem persists.
      </p>
    </div>
  );
};
