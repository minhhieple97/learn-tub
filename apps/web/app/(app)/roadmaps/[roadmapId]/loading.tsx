import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, Users } from "lucide-react";

function NodeCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-slate-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-4 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <Skeleton className="w-16 h-12 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoadmapDetailLoading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20 min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-9 w-32" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-4 w-80" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-10" />
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="text-center">
                <Skeleton className="mx-auto h-8 w-16" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                >
                  <Skeleton className="mx-auto mb-2 h-8 w-8" />
                  <Skeleton className="mx-auto h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="roadmap" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-lg border border-slate-200 bg-white/80 p-1 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
            <TabsTrigger value="roadmap" disabled>
              <BookOpen className="h-4 w-4 mr-2" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="mindmap" disabled>
              <Users className="h-4 w-4 mr-2" />
              Mind Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-4">
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NodeCardSkeleton key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
