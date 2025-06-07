import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function QuizDetailLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-96" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" /> {/* Value */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label */}
                <Skeleton className="h-4 w-36" /> {/* Value */}
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-10 w-32" /> {/* Retake button */}
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" /> {/* Questions title */}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-80" /> {/* Question text */}
                    <Skeleton className="h-6 w-16" /> {/* Topic badge */}
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded" />{' '}
                        {/* Radio button */}
                        <Skeleton className="h-4 w-64" /> {/* Option text */}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" /> {/* Your answer label */}
                    <Skeleton className="h-4 w-48" /> {/* Answer text */}
                    <Skeleton className="h-4 w-28" /> {/* Explanation label */}
                    <Skeleton className="h-16 w-full" />{' '}
                    {/* Explanation text */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attempt History Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" /> {/* Attempt History title */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" /> {/* Attempt number */}
                    <Skeleton className="h-4 w-32" /> {/* Date */}
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-6 w-16" /> {/* Score */}
                    <Skeleton className="h-4 w-20" /> {/* Percentage */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
