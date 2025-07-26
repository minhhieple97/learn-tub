"use client";

import { VideoGrid } from "./video-grid";
import { EmptyState } from "./empty-state";
import { IVideo } from "../types";

type VideoContentSectionProps = {
  videos: IVideo[] | null;
  searchQuery: string;
  className?: string;
};

export const VideoContentSection = ({
  videos,
  searchQuery,
  className,
}: VideoContentSectionProps) => {
  const hasVideos = videos && videos.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  if (hasVideos) {
    return (
      <div className={className}>
        <VideoGrid videos={videos} />
      </div>
    );
  }

  return (
    <div className={className}>
      <EmptyState
        searchQuery={isSearching ? searchQuery : undefined}
        title={isSearching ? "No Videos Found" : "No Videos Available"}
      />
    </div>
  );
};
