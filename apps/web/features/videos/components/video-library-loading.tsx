import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const VideoSearchSectionSkeleton = () => {
  return (
    <div className="mb-8">
      <div className="max-w-md mx-auto relative">
        <Skeleton className="h-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md" />
      </div>
    </div>
  );
};

const VideoCardSkeleton = () => {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 shadow-xl backdrop-blur-sm dark:from-slate-800/95 dark:via-slate-850/90 dark:to-slate-900/85">
      <div className="relative aspect-video shrink-0 overflow-hidden rounded-t-2xl">
        <Skeleton className="size-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-lg bg-blue-100 dark:bg-blue-900/50" />
            <Skeleton className="h-6 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
          <Skeleton className="h-5 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
      </CardContent>
    </Card>
  );
};

const VideoGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const VideoLibraryLoading = () => {
  return (
    <div className="space-y-8">
      <VideoSearchSectionSkeleton />
      <div className="min-h-[200px]">
        <VideoGridSkeleton />
      </div>
    </div>
  );
};
