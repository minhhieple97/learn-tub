import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-9 w-64" />
          </div>
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              <div className="p-6 space-y-4">
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

                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
