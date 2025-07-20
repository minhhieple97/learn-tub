"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play, Clock, User, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVideoMindmapNode } from "@/hooks/use-video-mindmap-node";

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

export const VideoMindmapNode = memo(({ data }: VideoMindmapNodeProps) => {
  const {
    statusColors,
    primaryVideo,
    hasVideo,
    formatDuration,
    handleVideoClick,
  } = useVideoMindmapNode(data);

  const nodeContent = (
    <div
      className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
      style={{
        background: statusColors.background,
        border: `3px solid ${statusColors.border}`,
        borderRadius: "12px",
        padding: "16px",
        minWidth: "180px",
        maxWidth: "220px",
        boxShadow: statusColors.shadow,
      }}
      onClick={handleVideoClick}
    >
      {/* Handles for ReactFlow connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-white"
        style={{ background: statusColors.border }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-white"
        style={{ background: statusColors.border }}
      />

      {/* Node content */}
      <div className="space-y-3">
        {/* Header with title and video indicator */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-sm text-gray-900 flex-1 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            {data.label}
          </h3>

          {/* Video indicator */}
          {hasVideo && (
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
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
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
              backgroundColor: statusColors.border + "20",
              color: statusColors.border,
            }}
          >
            {data.status}
          </span>

          {hasVideo && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Play className="w-3 h-3" />
              Watch
            </span>
          )}
        </div>
      </div>

      {/* Hover play overlay */}
      {hasVideo && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-red-600 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );

  // If no video, return the node without tooltip
  if (!hasVideo) {
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
              {primaryVideo?.thumbnailUrl ? (
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
              {primaryVideo?.duration && (
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
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                }}
              >
                {primaryVideo?.title}
              </h4>

              {primaryVideo?.channelName && (
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <User className="w-3 h-3" />
                  <span className="truncate">{primaryVideo.channelName}</span>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to watch on YouTube
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

VideoMindmapNode.displayName = "VideoMindmapNode";
