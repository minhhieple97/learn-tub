import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Play, Plus, Library, Youtube, Rocket } from "lucide-react";

function AddVideoFormSkeleton() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl dark:from-blue-600 dark:via-blue-700 dark:to-blue-800">
      <CardHeader className="relative pb-6 pt-8 text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
          <Youtube className="size-10 text-white" />
        </div>
        <Skeleton className="mx-auto mb-2 h-8 w-64 bg-white/30" />
        <Skeleton className="mx-auto h-5 w-80 bg-white/20" />
      </CardHeader>

      <CardContent className="relative space-y-6 pb-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 bg-white/30" />
            <div className="relative">
              <Skeleton className="h-14 w-full bg-white/95" />
            </div>
            <Skeleton className="h-4 w-72 bg-white/20" />
          </div>

          <Skeleton className="h-14 w-full bg-white/90" />
        </div>
      </CardContent>
    </Card>
  );
}

function HowItWorksSkeleton() {
  return (
    <Card className="flex h-full flex-col border border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg dark:border-blue-800 dark:from-slate-800 dark:to-blue-950/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="size-5 text-blue-600" />
          <Skeleton className="h-6 w-32 bg-blue-100 dark:bg-blue-900/50" />
        </div>
        <Skeleton className="h-4 w-64 bg-blue-50 dark:bg-blue-900/30" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-80" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-full bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function VideoSearchSectionSkeleton() {
  return (
    <div className="mb-8">
      <div className="max-w-md mx-auto relative">
        <Skeleton className="h-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md" />
      </div>
    </div>
  );
}

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

function VideoLibrarySkeleton() {
  return (
    <div className="space-y-8">
      <VideoSearchSectionSkeleton />
      <div className="min-h-[200px]">
        <VideoGridSkeleton />
      </div>
    </div>
  );
}

function VideoCardSkeleton() {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 shadow-xl backdrop-blur-sm dark:from-slate-800/95 dark:via-slate-850/90 dark:to-slate-900/85">
      <div className="relative aspect-video shrink-0 overflow-hidden rounded-t-2xl">
        <Skeleton className="size-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-full bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-lg bg-blue-100 dark:bg-blue-900/50" />
            <Skeleton className="h-6 w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
          <Skeleton className="h-5 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="mx-auto space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
              <Play className="size-8 text-blue-600" />
              Learn
            </h2>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
              Transform YouTube videos into interactive learning experiences
              with AI-powered insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-lg border border-slate-200 bg-white/80 p-1 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Plus className="size-4" />
              Add Video
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Library className="size-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="add"
            className="space-y-4 duration-300 animate-in fade-in-50"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AddVideoFormSkeleton />
              </div>
              <div className="lg:col-span-1">
                <HowItWorksSkeleton />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="library"
            className="duration-300 animate-in fade-in-50"
          >
            <VideoLibrarySkeleton />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
