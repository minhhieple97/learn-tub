import { Skeleton } from "@/components/ui/skeleton";

export const NotesListSkeleton = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Your Notes
      </h3>
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="p-3 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 space-y-2"
          >
            {/* Timestamp skeleton */}
            <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />

            {/* Content skeleton */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
