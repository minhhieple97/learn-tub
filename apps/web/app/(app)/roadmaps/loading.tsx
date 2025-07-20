import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

function RoadmapCardSkeleton() {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function ChatboxSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-800 border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-400" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="relative">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="absolute bottom-3 right-3">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MindmapSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border h-full flex flex-col">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      <div className="flex-1 min-h-0 p-8">
        <div className="relative h-full">
          {/* Central node */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="h-24 w-32 rounded-lg" />
          </div>

          {/* Surrounding nodes */}
          <div className="absolute top-1/4 left-1/4">
            <Skeleton className="h-16 w-24 rounded-lg" />
          </div>
          <div className="absolute top-1/4 right-1/4">
            <Skeleton className="h-16 w-24 rounded-lg" />
          </div>
          <div className="absolute bottom-1/4 left-1/4">
            <Skeleton className="h-16 w-24 rounded-lg" />
          </div>
          <div className="absolute bottom-1/4 right-1/4">
            <Skeleton className="h-16 w-24 rounded-lg" />
          </div>

          {/* Connection lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Skeleton className="h-px w-32 absolute top-0 left-16" />
            <Skeleton className="h-px w-32 absolute top-0 right-16" />
            <Skeleton className="h-32 w-px absolute top-12 left-0" />
            <Skeleton className="h-32 w-px absolute bottom-12 left-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoadmapsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          {/* Left Side - Roadmap List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
            </div>

            {/* Roadmap List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <RoadmapCardSkeleton key={i} />
              ))}
            </div>

            {/* Chatbox */}
            <ChatboxSkeleton />
          </div>

          {/* Right Side - Mindmap Visualization */}
          <div className="lg:col-span-2">
            <MindmapSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
