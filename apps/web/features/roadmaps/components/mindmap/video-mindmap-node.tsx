"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play, Clock, User, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type VideoNodeData = {
  label: string;
  status: string;
  skill: string;
  description?: string;
  nodeId?: string;
  isRoadmapNode?: boolean;
  videos?: {
    id: string;
    title: string;
    channelName?: string;
    thumbnailUrl?: string;
    duration?: number;
    youtubeId: string;
  }[];
};

type VideoMindmapNodeProps = NodeProps & {
  data: VideoNodeData;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
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
};

export const VideoMindmapNode = memo(({ data }: VideoMindmapNodeProps) => {
  const colors = getStatusColor(data.status);
  const primaryVideo = data.videos?.[0];

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

  const nodeContent = (
    <div
      className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
      style={{
        background: colors.background,
        border: `3px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
        maxWidth: '220px',
        boxShadow: colors.shadow,
      }}
      onClick={handleVideoClick}
    >
      {/* Handles for ReactFlow connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-white"
        style={{ background: colors.border }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-white"
        style={{ background: colors.border }}
      />

      {/* Node content */}
      <div className="space-y-3">
        {/* Header with title and video indicator */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm text-gray-900 flex-1 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
            }}
          >
            {data.label}
          </h3>

          {/* Video indicator */}
          {primaryVideo && (
            <div className="flex-shrink-0">
              <div className="bg-red-600 text-white rounded-full p-1.5 group-hover:scale-110 transition-transform duration-200">
                <Video className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p
            className="text-xs text-gray-600 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
            }}
          >
            {data.description}
          </p>
        )}

        {/* Status and action hint */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: colors.border + '20',
              color: colors.border,
            }}
          >
            {data.status}
          </span>

          {primaryVideo && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Play className="w-3 h-3" />
              Watch
            </span>
          )}
        </div>
      </div>

      {/* Hover play overlay */}
      {primaryVideo && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-red-600 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );

  // If no video, return the node without tooltip
  if (!primaryVideo) {
    return nodeContent;
  }

  // Render with tooltip for video information
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{nodeContent}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-0 overflow-hidden border-0 shadow-xl"
          sideOffset={8}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Video thumbnail */}
            <div className="relative h-32 bg-gray-200 dark:bg-gray-700">
              {primaryVideo.thumbnailUrl ? (
                <img
                  src={primaryVideo.thumbnailUrl}
                  alt={primaryVideo.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Video className="w-8 h-8" />
                </div>
              )}

              {/* Duration badge */}
              {primaryVideo.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(primaryVideo.duration)}
                </div>
              )}

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 text-white rounded-full p-2 opacity-90">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="p-3 space-y-2">
              <h4
                className="font-medium text-sm text-gray-900 dark:text-gray-100 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                }}
              >
                {primaryVideo.title}
              </h4>

              {primaryVideo.channelName && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <User className="w-3 h-3" />
                  <span className="truncate">{primaryVideo.channelName}</span>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">Click to watch on YouTube</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

VideoMindmapNode.displayName = "VideoMindmapNode"; 