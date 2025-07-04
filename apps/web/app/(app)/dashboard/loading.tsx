import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Brain,
  Video,
  Clock,
  BookOpen,
  TrendingUp,
  Zap,
  Trophy,
} from "lucide-react";

function DashboardHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="h-5 w-80" />
    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            {i === 0 && <Video className="size-4 text-muted-foreground" />}
            {i === 1 && <Clock className="size-4 text-muted-foreground" />}
            {i === 2 && <BookOpen className="size-4 text-muted-foreground" />}
            {i === 3 && <TrendingUp className="size-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-1 h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AIInsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="size-5" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              {i === 0 && <Brain className="size-4 text-muted-foreground" />}
              {i === 1 && <Zap className="size-4 text-muted-foreground" />}
              {i === 2 && <Trophy className="size-4 text-muted-foreground" />}
              {i === 3 && (
                <TrendingUp className="size-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-12" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-5 w-36" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <Zap className="mx-auto mb-4 size-12 text-muted-foreground" />
            <Skeleton className="mx-auto h-4 w-80" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



export default function Loading() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />

      <StatsGridSkeleton />

      <AIInsightsSkeleton />
    </div>
  );
}
