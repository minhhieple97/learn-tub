"use client";

import { useCallback, useMemo } from "react";

type VideoData = {
  id: string;
  title: string;
  channelName?: string;
  thumbnailUrl?: string;
  duration?: number;
  youtubeId: string;
};

type NodeData = {
  label: string;
  status: string;
  skill: string;
  description?: string;
  nodeId?: string;
  isRoadmapNode?: boolean;
  videos?: VideoData[];
};

type StatusColors = {
  border: string;
  background: string;
  shadow: string;
};

export const useVideoMindmapNode = (data: NodeData) => {
  // Status color calculation
  const statusColors = useMemo((): StatusColors => {
    switch (data.status) {
      case "active":
        return {
          border: "#059669",
          background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
          shadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
        };
      case "completed":
        return {
          border: "#2563eb",
          background: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
          shadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
        };
      case "in_progress":
        return {
          border: "#7c3aed",
          background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
          shadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
        };
      case "pending":
      default:
        return {
          border: "#d97706",
          background: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
          shadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
        };
    }
  }, [data.status]);

  // Primary video selection
  const primaryVideo = useMemo((): VideoData | undefined => {
    return data.videos?.[0];
  }, [data.videos]);

  // Duration formatting utility
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Video interaction handler
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (primaryVideo?.youtubeId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${primaryVideo.youtubeId}`;
        window.open(youtubeUrl, "_blank", "noopener,noreferrer");
      }
    },
    [primaryVideo?.youtubeId],
  );

  // Check if node has video content
  const hasVideo = useMemo((): boolean => {
    return Boolean(primaryVideo);
  }, [primaryVideo]);

  return {
    statusColors,
    primaryVideo,
    hasVideo,
    formatDuration,
    handleVideoClick,
  };
};
