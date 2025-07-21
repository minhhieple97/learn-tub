"use client";

import { memo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMindmapRenderer } from "@/features/roadmaps/hooks/use-mindmap-renderer";

type IMindmapRendererProps = {
  nodes: Node[];
  edges: Edge[];
};

export const MindmapRenderer = memo(
  ({ nodes, edges }: IMindmapRendererProps) => {
    const { flowNodes, flowEdges, onNodesChange, onEdgesChange, nodeTypes } =
      useMindmapRenderer({
        nodes,
        edges,
      });

    return (
      <div
        className="w-full h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200"
        style={{ minHeight: "400px" }}
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
          style={{ width: "100%", height: "100%" }}
        >
          <Controls position="top-right" />
          <Background
            color="currentColor"
            gap={16}
            className="text-slate-300 dark:text-slate-600"
          />
        </ReactFlow>
      </div>
    );
  },
);

MindmapRenderer.displayName = "MindmapRenderer";
