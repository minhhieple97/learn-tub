import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="pt-12 pb-8 text-center">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="py-12">
          {/* Header Section Skeleton */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Skeleton className="h-8 w-8 mr-2" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Pricing Cards Skeleton */}
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                {/* Popular Badge */}
                {index === 0 && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                )}

                {/* Card Header */}
                <div className="pb-6 pt-8 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Skeleton className="w-16 h-16 rounded-2xl" />
                  </div>
                  <Skeleton className="h-7 w-20 mx-auto mb-2" />
                  <Skeleton className="h-5 w-full mb-6" />
                  <div className="flex items-baseline justify-center">
                    <Skeleton className="h-12 w-16" />
                    <Skeleton className="h-6 w-12 ml-2" />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-6">
                  {Array.from({ length: index === 0 ? 6 : 8 }).map(
                    (_, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <Skeleton className="h-5 w-5 mr-3 rounded-sm mt-0.5" />
                        <Skeleton className="h-5 flex-1" />
                      </div>
                    ),
                  )}
                </div>

                {/* Button */}
                <Skeleton className="h-12 w-full rounded-md mb-4" />

                {/* Additional info */}
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center mt-16">
            <Skeleton className="h-5 w-80 mx-auto mb-4" />
            <Skeleton className="h-10 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
