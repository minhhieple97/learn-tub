import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-2">
        <div className="pt-8 pb-6 text-center">
          <Skeleton className="h-9 w-80 mx-auto mb-3" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto pb-8">
          {/* Subscription Management Card Skeleton */}
          <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
            {/* Card Header */}
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              {/* Subscription Dates Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </div>

              {/* Button Skeleton */}
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
