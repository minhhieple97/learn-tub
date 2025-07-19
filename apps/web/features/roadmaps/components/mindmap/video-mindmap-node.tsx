"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play, Clock, User } from "lucide-react";

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

  const handleNodeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // If no video, just prevent default behavior
      if (!primaryVideo?.youtubeId) {
        return;
      }
      // Otherwise, open the video
      handleVideoClick(e);
    },
    [primaryVideo?.youtubeId, handleVideoClick],
  );

  return (
    <div
      className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
      style={{
        background: colors.background,
        border: `3px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "0",
        minWidth: "240px",
        maxWidth: "280px",
        boxShadow: colors.shadow,
        overflow: "hidden",
      }}
      onClick={handleNodeClick}
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

      {/* Video thumbnail section */}
      {primaryVideo && (
        <div className="relative">
          <div
            className="w-full h-32 bg-cover bg-center bg-gray-200 flex items-center justify-center"
            style={{
              backgroundImage: primaryVideo.thumbnailUrl
                ? `url(${primaryVideo.thumbnailUrl})`
                : undefined,
            }}
          >
            {!primaryVideo.thumbnailUrl && (
              <div className="text-gray-400 text-4xl">📹</div>
            )}
            
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-red-600 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Duration badge */}
            {primaryVideo.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(primaryVideo.duration)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content section */}
      <div className="p-3">
        {/* Node title */}
        <h3 
          className="font-semibold text-sm text-gray-900 mb-1 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {data.label}
        </h3>

        {/* Video title (if different from node title) */}
        {primaryVideo && primaryVideo.title !== data.label && (
          <p 
            className="text-xs text-gray-600 mb-2 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            📹 {primaryVideo.title}
          </p>
        )}

        {/* Channel info */}
        {primaryVideo?.channelName && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <User className="w-3 h-3" />
            <span 
              className="overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                textOverflow: "ellipsis",
              }}
            >
              {primaryVideo.channelName}
            </span>
          </div>
        )}

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

        {/* Status indicator */}
        <div className="mt-2 flex items-center justify-between">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: colors.border + "20",
              color: colors.border,
            }}
          >
            {data.status}
          </span>
          
          {primaryVideo && (
            <span className="text-xs text-gray-500">Click to watch</span>
          )}
        </div>
      </div>

      {/* No video state */}
      {!primaryVideo && (
        <div className="p-3 text-center">
          <div className="text-gray-400 text-2xl mb-2">📝</div>
          <p className="text-xs text-gray-500">No video available</p>
        </div>
      )}
    </div>
  );
});

VideoMindmapNode.displayName = "VideoMindmapNode"; 