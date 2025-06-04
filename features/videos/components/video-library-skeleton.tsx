import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const VideoLibrarySkeleton = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card
            key={i}
            className="group overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 dark:from-slate-800/90 dark:via-slate-850/80 dark:to-slate-900/70 backdrop-blur-sm"
          >
            <div className="relative">
              <Skeleton className="aspect-video w-full rounded-t-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
            </div>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4">
              <Skeleton className="h-5 w-28 rounded-lg" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
