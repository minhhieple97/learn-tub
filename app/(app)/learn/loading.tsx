import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Play, Plus, Library, Youtube, Rocket } from 'lucide-react';

function AddVideoFormSkeleton() {
  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800">
      <CardHeader className="relative text-center pb-6 pt-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
          <Youtube className="h-10 w-10 text-white" />
        </div>
        <Skeleton className="h-8 w-64 mx-auto mb-2 bg-white/30" />
        <Skeleton className="h-5 w-80 mx-auto bg-white/20" />
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

          <Skeleton className="w-full h-14 bg-white/90" />
        </div>
      </CardContent>
    </Card>
  );
}

function HowItWorksSkeleton() {
  return (
    <Card className="h-full flex flex-col border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          <Skeleton className="h-6 w-32 bg-blue-100 dark:bg-blue-900/50" />
        </div>
        <Skeleton className="h-4 w-64 bg-blue-50 dark:bg-blue-900/30" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-80" />
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

export default function Loading() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Play className="h-8 w-8 text-blue-600" />
              Learn
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">
              Transform YouTube videos into interactive learning experiences with AI-powered
              insights
            </p>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Video
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              <Library className="h-4 w-4" />
              My Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AddVideoFormSkeleton />
              </div>

              <div className="lg:col-span-1 space-y-4">
                <HowItWorksSkeleton />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="animate-in fade-in-50 duration-300">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Card className="group h-full flex flex-col overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-slate-50/90 to-slate-100/80 dark:from-slate-800/95 dark:via-slate-850/90 dark:to-slate-900/85 backdrop-blur-sm rounded-2xl">
                      <div className="aspect-video relative overflow-hidden rounded-t-2xl flex-shrink-0">
                        <Skeleton className="w-full h-full" />
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-4 mt-auto flex-wrap">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-16 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                          </div>
                          <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
