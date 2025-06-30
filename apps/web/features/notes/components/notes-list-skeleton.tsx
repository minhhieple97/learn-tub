import { Skeleton } from '@/components/ui/skeleton';

export const NotesListSkeleton = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Your Notes</h3>
      <div className="max-h-96 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 border rounded-lg bg-white shadow-sm space-y-2">
            {/* Timestamp skeleton */}
            <Skeleton className="h-4 w-16" />

            {/* Content skeleton */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
