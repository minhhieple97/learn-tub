import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function QuizRetakeLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled
          className="flex items-center gap-2 opacity-50"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-muted p-6">
            <Skeleton className="size-12 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-muted p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-6 w-8" />
              <Skeleton className="mx-auto h-4 w-16" />
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-6 w-12" />
              <Skeleton className="mx-auto h-4 w-16" />
            </div>
          </div>
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mx-auto h-4 w-3/4" />
            </div>
            <Skeleton className="mx-auto h-10 w-32 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
