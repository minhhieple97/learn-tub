"use client";

import { useEffect, memo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { VideoMindmapNode } from './video-mindmap-node';

type IMindmapRendererProps = {
  nodes: Node[];
  edges: Edge[];
};

// Define custom node types
const nodeTypes = {
  videoNode: VideoMindmapNode,
};

export const MindmapRenderer = memo(({ nodes, edges }: IMindmapRendererProps) => {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  // Inject dark mode styles for React Flow controls
  useEffect(() => {
    const styleId = 'react-flow-dark-mode-styles';

    // Remove existing styles if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new styles
    const style = document.createElement('style');
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

  return (
    <div
      className="w-full h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200"
      style={{ minHeight: '400px' }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-slate-50 dark:bg-slate-900"
        style={{ width: '100%', height: '100%' }}
      >
        <Controls position="top-right" />
        <Background color="currentColor" gap={16} className="text-slate-300 dark:text-slate-600" />
      </ReactFlow>
    </div>
  );
});

MindmapRenderer.displayName = "MindmapRenderer";
