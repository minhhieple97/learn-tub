"use client";

import { use } from "react";
import { IVideo } from "../types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useVideoSearch } from "@/features/videos/hooks/use-video-search";
import { VideoSearchSection } from "./video-search-section";
import { VideoContentSection } from "./video-content-section";

type VideoLibraryProps = {
  videosPromise: Promise<IVideo[] | null>;
};

export const VideoLibrary = ({ videosPromise }: VideoLibraryProps) => {
  const videos = use(videosPromise);
  const { searchQuery } = useVideoSearch();

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <VideoSearchSection className="mb-8" />
        <VideoContentSection
          videos={videos}
          searchQuery={searchQuery}
          className="min-h-[200px]"
        />
      </div>
    </TooltipProvider>
  );
};
