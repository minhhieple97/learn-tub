"use client";

import { useMemo } from "react";
import { Node, Edge, Position } from "@xyflow/react";
import type {
  LearningRoadmap,
  RoadmapWithNodes,
  RoadmapNodeWithVideos,
} from "@/features/roadmaps/types";

type MindmapNode = Node & {
  data: {
    label: string;
    status: string;
    skill: string;
    description?: string;
    nodeId?: string;
    isRoadmapNode?: boolean;
  };
};

type StatusColors = {
  border: string;
  background: string;
  shadow: string;
};

export const getStatusColor = (status: string): StatusColors => {
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
    case "draft":
      return {
        border: "#4b5563",
        background: "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
        shadow: "0 4px 12px rgba(75, 85, 99, 0.2)",
      };
    case "archived":
      return {
        border: "#d97706",
        background: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
        shadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
      };
    case "pending":
      return {
        border: "#d97706",
        background: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
        shadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
      };
    case "in_progress":
      return {
        border: "#7c3aed",
        background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
        shadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
      };
    default:
      return {
        border: "#4b5563",
        background: "linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)",
        shadow: "0 4px 12px rgba(75, 85, 99, 0.2)",
      };
  }
};

const createRoadmapCircularLayout = (
  roadmaps: LearningRoadmap[],
): { nodes: MindmapNode[]; edges: Edge[] } => {
  const nodes: MindmapNode[] = [];
  const edges: Edge[] = [];

  if (roadmaps.length === 0) {
    return { nodes: [], edges: [] };
  }

  const uniqueRoadmaps = roadmaps.filter(
    (roadmap, index, self) =>
      index === self.findIndex((r) => r.id === roadmap.id),
  );

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
      background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
      border: "3px solid #60a5fa",
      borderRadius: "16px",
      padding: "16px",
      fontSize: "18px",
      fontWeight: "bold",
      color: "#ffffff",
      boxShadow: "0 8px 25px rgba(96, 165, 250, 0.4)",
      minWidth: "180px",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  nodes.push(centerNode);

  const radius = 200;
  const angleStep = (2 * Math.PI) / uniqueRoadmaps.length;

  uniqueRoadmaps.forEach((roadmap, index) => {
    const angle = index * angleStep;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);
    const colors = getStatusColor(roadmap.status || "draft");

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
        background: colors.background,
        border: `3px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "12px",
        fontSize: "14px",
        minWidth: "150px",
        boxShadow: colors.shadow,
        color: "#1f2937",
        fontWeight: "600",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    nodes.push(roadmapNode);

    const edge = {
      id: `edge-center-to-${roadmap.id}`,
      source: "center",
      target: roadmap.id,
      type: "smoothstep",
      style: {
        stroke: colors.border,
        strokeWidth: 3,
      },
    };

    edges.push(edge);
  });

  return { nodes, edges };
};

const createNodeHierarchicalLayout = (
  roadmap: RoadmapWithNodes,
): { nodes: MindmapNode[]; edges: Edge[] } => {
  const nodes: MindmapNode[] = [];
  const edges: Edge[] = [];

  if (!roadmap.nodes || roadmap.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const rootNode: MindmapNode = {
    id: `roadmap-${roadmap.id}`,
    type: "default",
    position: { x: 400, y: 50 },
    data: {
      label: roadmap.title || "Learning Roadmap",
      status: roadmap.status || "draft",
      skill: roadmap.skill_name,
      description: roadmap.description || undefined,
    },
    style: {
      background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      border: "4px solid #1d4ed8",
      borderRadius: "16px",
      padding: "20px",
      fontSize: "20px",
      fontWeight: "bold",
      minWidth: "250px",
      color: "#ffffff",
      boxShadow: "0 10px 30px rgba(29, 78, 216, 0.4)",
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };

  nodes.push(rootNode);

  const rootNodes = roadmap.nodes.filter(
    (node) => node.level === 0 || !node.parent_node_id,
  );

  const processedNodes = new Set<string>();

  const processNode = (
    node: RoadmapNodeWithVideos,
    level: number,
    parentX: number,
    parentY: number,
    siblingIndex: number,
    totalSiblings: number,
    parentId: string,
  ) => {
    if (processedNodes.has(node.id)) {
      return;
    }
    processedNodes.add(node.id);

    const levelY = parentY + 140;
    const spreadWidth = Math.max(400, totalSiblings * 200);
    const startX = parentX - spreadWidth / 2;
    const nodeX =
      totalSiblings === 1
        ? parentX
        : startX +
          (siblingIndex * spreadWidth) / Math.max(1, totalSiblings - 1);

    const colors = getStatusColor(node.status || "pending");

    const mindmapNode: MindmapNode = {
      id: node.id,
      type: "default",
      position: { x: nodeX, y: levelY },
      data: {
        label: node.title,
        status: node.status || "pending",
        skill: "Node",
        description: node.description || undefined,
        nodeId: node.id,
        isRoadmapNode: true,
      },
      style: {
        background: colors.background,
        border: `3px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "14px",
        fontSize: "14px",
        minWidth: "180px",
        maxWidth: "220px",
        boxShadow: colors.shadow,
        color: "#1f2937",
        fontWeight: "600",
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };

    nodes.push(mindmapNode);

    const edge: Edge = {
      id: `edge-${parentId}-to-${node.id}`,
      source: parentId,
      target: node.id,
      type: "smoothstep",
      style: {
        stroke: colors.border,
        strokeWidth: 3,
      },
    };

    edges.push(edge);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child, index) => {
        processNode(
          child,
          level + 1,
          nodeX,
          levelY,
          index,
          node.children!.length,
          node.id,
        );
      });
    }
  };

  rootNodes.forEach((node, index) => {
    processNode(
      node,
      1,
      400,
      50,
      index,
      rootNodes.length,
      `roadmap-${roadmap.id}`,
    );
  });

  return { nodes, edges };
};

type UseMindmapLayoutProps = {
  roadmaps: LearningRoadmap[];
  generatedRoadmap?: RoadmapWithNodes;
  selectedRoadmap?: RoadmapWithNodes | null;
};

export const useMindmapLayout = ({
  roadmaps,
  generatedRoadmap,
  selectedRoadmap,
}: UseMindmapLayoutProps) => {
  const shouldShowNodeLayout = generatedRoadmap || selectedRoadmap;
  const roadmapToShow = generatedRoadmap || selectedRoadmap;

  const layout = useMemo(() => {
    if (shouldShowNodeLayout && roadmapToShow) {
      console.log(
        "📋 Showing node layout for roadmap:",
        roadmapToShow.title,
        "with",
        roadmapToShow.nodes?.length,
        "nodes",
      );
      return createNodeHierarchicalLayout(roadmapToShow);
    } else {
      return createRoadmapCircularLayout(roadmaps);
    }
  }, [roadmaps, shouldShowNodeLayout, roadmapToShow]);

  return {
    nodes: layout.nodes,
    edges: layout.edges,
    shouldShowNodeLayout,
    roadmapToShow,
  };
};
