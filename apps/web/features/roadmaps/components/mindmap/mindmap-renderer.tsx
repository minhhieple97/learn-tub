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

type MindmapRendererProps = {
  nodes: Node[];
  edges: Edge[];
};

// Define custom node types
const nodeTypes = {
  videoNode: VideoMindmapNode,
};

export const MindmapRenderer = memo(
  ({ nodes, edges }: MindmapRendererProps) => {
    const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

    useEffect(() => {
      setFlowNodes(nodes);
      setFlowEdges(edges);
    }, [nodes, edges, setFlowNodes, setFlowEdges]);

    return (
      <div className="w-full h-full" style={{ minHeight: '400px' }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{ width: '100%', height: '100%' }}
        >
          <Controls position="top-right" />
          <Background color="#f1f5f9" gap={16} />
        </ReactFlow>
      </div>
    );
  },
);

MindmapRenderer.displayName = "MindmapRenderer";
