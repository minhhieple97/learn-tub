"use client";

import { use } from "react";
import { VideoLibraryEmpty } from "./video-library-empty";
import { VideoGrid } from "./video-grid";
import { IVideo } from "../types";
import { TooltipProvider } from '@/components/ui/tooltip';
import { useVideoSearch } from '@/hooks/use-video-search';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VideoLibraryProps = {
  videosPromise: Promise<IVideo[] | null>;
};

export const VideoLibrary = ({ videosPromise }: VideoLibraryProps) => {
  const videos = use(videosPromise);
  const { searchQuery, setSearchQuery } = useVideoSearch();


  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <Input
              placeholder="Search videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'pl-10 pr-10 py-2 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0',
                'shadow-sm hover:shadow transition-shadow duration-200',
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 h-8 w-8 p-0 rounded-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        {videos && videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="text-center py-4">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              No Videos Found
            </h3>
            {searchQuery && (
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Your search for "{searchQuery}" did not return any results.
              </p>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
