"use client";

import { useEffect, useMemo } from "react";
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import { VideoMindmapNode } from "@/features/roadmaps/components/mindmap/video-mindmap-node";

type UseMindmapRendererProps = {
  nodes: Node[];
  edges: Edge[];
};

export const useMindmapRenderer = ({
  nodes,
  edges,
}: UseMindmapRendererProps) => {
  // Flow state management
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Node types configuration
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      videoNode: VideoMindmapNode,
    }),
    [],
  );

  // Sync external props with internal state
  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  // Dynamic CSS injection for React Flow dark mode support
  useEffect(() => {
    const styleId = "react-flow-dark-mode-styles";

    // Remove existing styles if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new styles
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .dark .react-flow__controls {
        background: rgb(30 41 59) !important;
        border-color: rgb(51 65 85) !important;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
      }
      
      .dark .react-flow__controls-button {
        background: rgb(30 41 59) !important;
        border-color: rgb(51 65 85) !important;
        color: rgb(203 213 225) !important;
        fill: rgb(203 213 225) !important;
      }
      
      .dark .react-flow__controls-button:hover {
        background: rgb(51 65 85) !important;
      }
      
      .dark .react-flow__controls-button svg {
        color: rgb(203 213 225) !important;
        fill: rgb(203 213 225) !important;
      }

      /* Light mode styles */
      .react-flow__controls {
        background: white !important;
        border-color: rgb(226 232 240) !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }
      
      .react-flow__controls-button {
        background: white !important;
        border-color: rgb(226 232 240) !important;
        color: rgb(51 65 85) !important;
        transition: all 0.2s ease !important;
      }
      
      .react-flow__controls-button:hover {
        background: rgb(248 250 252) !important;
      }
      
      .react-flow__controls-button svg {
        color: rgb(51 65 85) !important;
        fill: rgb(51 65 85) !important;
      }
    `;

    document.head.appendChild(style);

    // Cleanup function to remove styles when component unmounts
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return {
    // Flow state
    flowNodes,
    flowEdges,
    onNodesChange,
    onEdgesChange,

    // Configuration
    nodeTypes,
  };
};
