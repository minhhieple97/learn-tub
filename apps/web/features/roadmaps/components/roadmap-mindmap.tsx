"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import type { LearningRoadmap } from "../types";

type RoadmapMindmapProps = {
  roadmaps: LearningRoadmap[];
  isGenerating?: boolean;
  generatedRoadmap?: any;
};

type MindmapNode = Node & {
  data: {
    label: string;
    status: string;
    skill: string;
    description?: string;
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "#10b981"; // green
    case "completed":
      return "#3b82f6"; // blue
    case "draft":
      return "#6b7280"; // gray
    case "archived":
      return "#f59e0b"; // orange
    default:
      return "#6b7280";
  }
};

const createMindmapLayout = (
  roadmaps: LearningRoadmap[],
): { nodes: MindmapNode[]; edges: Edge[] } => {
  const nodes: MindmapNode[] = [];
  const edges: Edge[] = [];

  if (roadmaps.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Deduplicate roadmaps by ID to prevent duplicate keys
  const uniqueRoadmaps = roadmaps.filter(
    (roadmap, index, self) =>
      index === self.findIndex((r) => r.id === roadmap.id),
  );

  // Create central node
  const centerNode: MindmapNode = {
    id: "center",
    type: "default",
    position: { x: 400, y: 300 },
    data: {
      label: "Learning Journey",
      status: "active",
      skill: "Overview",
      description: "Your learning roadmaps",
    },
    style: {
      backgroundColor: "#f3f4f6",
      border: "2px solid #374151",
      borderRadius: "12px",
      padding: "12px",
      fontSize: "16px",
      fontWeight: "bold",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  nodes.push(centerNode);

  // Create roadmap nodes in a circular layout
  const radius = 200;
  const angleStep = (2 * Math.PI) / uniqueRoadmaps.length;

  uniqueRoadmaps.forEach((roadmap, index) => {
    const angle = index * angleStep;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);

    const roadmapNode: MindmapNode = {
      id: roadmap.id,
      type: "default",
      position: { x, y },
      data: {
        label: roadmap.title || "Untitled Roadmap",
        status: roadmap.status || "draft",
        skill: roadmap.skill_name,
        description: roadmap.description || undefined,
      },
      style: {
        backgroundColor: "#ffffff",
        border: `2px solid ${getStatusColor(roadmap.status || "draft")}`,
        borderRadius: "8px",
        padding: "8px",
        fontSize: "14px",
        minWidth: "150px",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    nodes.push(roadmapNode);

    // Create edge from center to roadmap
    const edge = {
      id: `edge-center-to-${roadmap.id}`,
      source: "center",
      target: roadmap.id,
      type: "smoothstep",
      style: {
        stroke: getStatusColor(roadmap.status || "draft"),
        strokeWidth: 2,
      },
    };

    edges.push(edge);
  });

  return { nodes, edges };
};

export const RoadmapMindmap = ({
  roadmaps,
  isGenerating,
  generatedRoadmap,
}: RoadmapMindmapProps) => {
  const [mounted, setMounted] = useState(false);

  // Memoize the layout calculation to prevent unnecessary re-renders
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    const result = createMindmapLayout(roadmaps);
    return result;
  }, [roadmaps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Loading mindmap...
      </div>
    );
  }

  if (roadmaps.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold mb-2">No roadmaps to visualize</h3>
        <p className="text-sm">
          Create your first roadmap to see it here as a mindmap.
        </p>
      </div>
    );
  }

  if (isGenerating && roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="animate-spin text-4xl mb-4">🧠</div>
        <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Generating Your Learning Roadmap
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          AI is analyzing your request and finding the best YouTube videos...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: "400px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        style={{ width: "100%", height: "100%" }}
      >
        <Controls position="top-right" />
        <Background color="#f1f5f9" gap={16} />
      </ReactFlow>
    </div>
  );
};
