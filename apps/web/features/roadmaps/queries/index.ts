import "server-only";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type {
  LearningRoadmap,
  LearningRoadmapInsert,
  LearningRoadmapUpdate,
  RoadmapNode,
  RoadmapNodeInsert,
  RoadmapNodeUpdate,
  RoadmapNodeVideo,
  RoadmapNodeVideoInsert,
  RoadmapProgress,
  RoadmapProgressInsert,
  RoadmapProgressUpdate,
  RoadmapInteraction,
  RoadmapInteractionInsert,
  RoadmapWithNodes,
  RoadmapNodeWithVideos,
  RoadmapNodeVideoWithDetails,
  RoadmapProgressSummary,
  MindmapData,
  MindmapNode,
  RoadmapNodeStatus,
} from "../types";

// Roadmap CRUD operations
export const getUserRoadmaps = cache(
  async (userId: string): Promise<LearningRoadmap[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("learning_roadmaps")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user roadmaps:", error);
      throw new Error(`Failed to fetch roadmaps: ${error.message}`);
    }

    return data || [];
  },
);

export const getRoadmapById = cache(
  async (
    roadmapId: string,
    userId: string,
  ): Promise<LearningRoadmap | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("learning_roadmaps")
      .select("*")
      .eq("id", roadmapId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching roadmap:", error);
      throw new Error(`Failed to fetch roadmap: ${error.message}`);
    }

    return data;
  },
);

export const getRoadmapWithNodes = cache(
  async (
    roadmapId: string,
    userId: string,
  ): Promise<RoadmapWithNodes | null> => {
    const supabase = await createClient();

    // First get the roadmap
    const roadmap = await getRoadmapById(roadmapId, userId);
    if (!roadmap) {
      return null;
    }

    // Get all nodes for this roadmap with videos and progress
    const { data: nodes, error: nodesError } = await supabase
      .from("roadmap_nodes")
      .select(
        `
      *,
      roadmap_node_videos (
        *,
        videos (*)
      ),
      roadmap_progress (*)
    `,
      )
      .eq("roadmap_id", roadmapId)
      .order("level", { ascending: true })
      .order("order_index", { ascending: true });

    if (nodesError) {
      console.error("Error fetching roadmap nodes:", nodesError);
      throw new Error(`Failed to fetch roadmap nodes: ${nodesError.message}`);
    }

    // Transform the data to match our types
    const transformedNodes: RoadmapNodeWithVideos[] = (nodes || []).map(
      (node) => ({
        ...node,
        videos: (node.roadmap_node_videos || []).map((nv: any) => ({
          ...nv,
          video: nv.videos,
        })) as RoadmapNodeVideoWithDetails[],
        progress: node.roadmap_progress?.[0] || undefined,
      }),
    );

    // Build hierarchical structure
    const nodeMap = new Map<string, RoadmapNodeWithVideos>();
    const rootNodes: RoadmapNodeWithVideos[] = [];

    // First pass: create map and identify root nodes
    transformedNodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
      if (!node.parent_node_id) {
        rootNodes.push(nodeMap.get(node.id)!);
      }
    });

    // Second pass: build hierarchy
    transformedNodes.forEach((node) => {
      if (node.parent_node_id) {
        const parent = nodeMap.get(node.parent_node_id);
        const child = nodeMap.get(node.id);
        if (parent && child) {
          parent.children = parent.children || [];
          parent.children.push(child);
        }
      }
    });

    return {
      ...roadmap,
      nodes: Array.from(nodeMap.values()),
      total_nodes: transformedNodes.length,
      completed_nodes: transformedNodes.filter((n) => n.status === "completed")
        .length,
      total_duration: transformedNodes.reduce(
        (sum, n) => sum + (n.estimated_duration_minutes || 0),
        0,
      ),
    };
  },
);

export const createRoadmap = async (
  data: LearningRoadmapInsert,
): Promise<LearningRoadmap> => {
  const supabase = await createClient();

  const { data: roadmap, error } = await supabase
    .from("learning_roadmaps")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating roadmap:", error);
    throw new Error(`Failed to create roadmap: ${error.message}`);
  }

  return roadmap;
};

export const updateRoadmap = async (
  roadmapId: string,
  userId: string,
  updates: LearningRoadmapUpdate,
): Promise<LearningRoadmap> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_roadmaps")
    .update(updates)
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating roadmap:", error);
    throw new Error(`Failed to update roadmap: ${error.message}`);
  }

  return data;
};

export const deleteRoadmap = async (
  roadmapId: string,
  userId: string,
): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("learning_roadmaps")
    .delete()
    .eq("id", roadmapId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting roadmap:", error);
    throw new Error(`Failed to delete roadmap: ${error.message}`);
  }
};

// Node operations
export const createRoadmapNode = async (
  data: RoadmapNodeInsert,
): Promise<RoadmapNode> => {
  const supabase = await createClient();

  const { data: node, error } = await supabase
    .from("roadmap_nodes")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating roadmap node:", error);
    throw new Error(`Failed to create roadmap node: ${error.message}`);
  }

  return node;
};

export const updateRoadmapNode = async (
  nodeId: string,
  updates: RoadmapNodeUpdate,
): Promise<RoadmapNode> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmap_nodes")
    .update(updates)
    .eq("id", nodeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating roadmap node:", error);
    throw new Error(`Failed to update roadmap node: ${error.message}`);
  }

  return data;
};

export const deleteRoadmapNode = async (nodeId: string): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("roadmap_nodes")
    .delete()
    .eq("id", nodeId);

  if (error) {
    console.error("Error deleting roadmap node:", error);
    throw new Error(`Failed to delete roadmap node: ${error.message}`);
  }
};

// Video-Node linking operations
export const addVideoToNode = async (
  data: RoadmapNodeVideoInsert,
): Promise<RoadmapNodeVideo> => {
  const supabase = await createClient();

  const { data: nodeVideo, error } = await supabase
    .from("roadmap_node_videos")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error adding video to node:", error);
    throw new Error(`Failed to add video to node: ${error.message}`);
  }

  return nodeVideo;
};

export const removeVideoFromNode = async (
  nodeId: string,
  videoId: string,
): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("roadmap_node_videos")
    .delete()
    .eq("node_id", nodeId)
    .eq("video_id", videoId);

  if (error) {
    console.error("Error removing video from node:", error);
    throw new Error(`Failed to remove video from node: ${error.message}`);
  }
};

// Progress tracking operations
export const getRoadmapProgress = cache(
  async (
    roadmapId: string,
    userId: string,
  ): Promise<RoadmapProgressSummary | null> => {
    const supabase = await createClient();

    // Get roadmap with nodes and progress
    const roadmapWithNodes = await getRoadmapWithNodes(roadmapId, userId);
    if (!roadmapWithNodes) {
      return null;
    }

    const nodes = roadmapWithNodes.nodes;
    const totalNodes = nodes.length;
    const completedNodes = nodes.filter((n) => n.status === "completed").length;
    const inProgressNodes = nodes.filter(
      (n) => n.status === "in_progress",
    ).length;
    const pendingNodes = nodes.filter((n) => n.status === "pending").length;
    const skippedNodes = nodes.filter((n) => n.status === "skipped").length;

    // Get total time spent from progress records
    const { data: progressRecords, error: progressError } = await supabase
      .from("roadmap_progress")
      .select("time_spent_minutes")
      .eq("roadmap_id", roadmapId)
      .eq("user_id", userId);

    if (progressError) {
      console.error("Error fetching progress records:", progressError);
    }

    const totalTimeSpent = (progressRecords || []).reduce(
      (sum, record) => sum + (record.time_spent_minutes || 0),
      0,
    );

    const totalEstimatedTime = nodes.reduce(
      (sum, node) => sum + (node.estimated_duration_minutes || 0),
      0,
    );

    const completionPercentage =
      totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
    const estimatedTimeRemaining = Math.max(
      0,
      totalEstimatedTime - totalTimeSpent,
    );

    // Find current level and next suggested node
    const completedLevels = [
      ...new Set(
        nodes.filter((n) => n.status === "completed").map((n) => n.level),
      ),
    ];
    const currentLevel =
      completedLevels.length > 0 ? Math.max(...completedLevels) : 0;

    const nextSuggestedNode = nodes
      .filter((n) => n.status === "pending" && n.level <= currentLevel + 1)
      .sort((a, b) => a.level - b.level || a.order_index - b.order_index)[0];

    return {
      roadmapId,
      totalNodes,
      completedNodes,
      inProgressNodes,
      pendingNodes,
      skippedNodes,
      totalTimeSpent,
      estimatedTimeRemaining,
      completionPercentage,
      currentLevel,
      nextSuggestedNode,
    };
  },
);

export const updateNodeProgress = async (
  nodeId: string,
  userId: string,
  roadmapId: string,
  updates: Pick<RoadmapProgressInsert, "time_spent_minutes" | "notes">,
): Promise<RoadmapProgress> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roadmap_progress")
    .upsert({
      roadmap_id: roadmapId,
      node_id: nodeId,
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating node progress:", error);
    throw new Error(`Failed to update node progress: ${error.message}`);
  }

  return data;
};

export const markNodeCompleted = async (
  nodeId: string,
  userId: string,
  roadmapId: string,
): Promise<void> => {
  const supabase = await createClient();

  // Update node status
  await updateRoadmapNode(nodeId, { status: "completed" });

  // Update progress record
  await supabase.from("roadmap_progress").upsert({
    roadmap_id: roadmapId,
    node_id: nodeId,
    user_id: userId,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};

// Interaction tracking
export const createRoadmapInteraction = async (
  data: RoadmapInteractionInsert,
): Promise<RoadmapInteraction> => {
  const supabase = await createClient();

  const { data: interaction, error } = await supabase
    .from("roadmap_interactions")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating roadmap interaction:", error);
    throw new Error(`Failed to create roadmap interaction: ${error.message}`);
  }

  return interaction;
};

// Mindmap data transformation
export const getRoadmapMindmapData = cache(
  async (roadmapId: string, userId: string): Promise<MindmapData | null> => {
    const roadmapWithNodes = await getRoadmapWithNodes(roadmapId, userId);
    if (!roadmapWithNodes) {
      return null;
    }

    const buildMindmapNode = (node: RoadmapNodeWithVideos): MindmapNode => {
      return {
        id: node.id,
        label: node.title,
        description: node.description ?? undefined,
        level: node.level,
        status: node.status as RoadmapNodeStatus,
        children: (node.children || []).map(buildMindmapNode),
        data: {
          nodeId: node.id,
          videos: node.videos.map((v) => ({
            id: v.video.id,
            title: v.video.title,
            thumbnailUrl: v.video.thumbnail_url || "",
            duration: v.video.duration || 0,
          })),
          progress: node.progress
            ? {
                completed: node.status === "completed",
                timeSpent: node.progress.time_spent_minutes || 0,
              }
            : undefined,
        },
      };
    };

    // Find root nodes (level 0 or no parent)
    const rootNodes = roadmapWithNodes.nodes.filter(
      (n) => n.level === 0 || !n.parent_node_id,
    );

    // For simplicity, create a single root if multiple root nodes exist
    const root: MindmapNode =
      rootNodes.length === 1
        ? buildMindmapNode(rootNodes[0]!)
        : {
            id: `${roadmapId}-root`,
            label: roadmapWithNodes.title,
            description: roadmapWithNodes.description ?? undefined,
            level: 0,
            status: "pending" as RoadmapNodeStatus,
            children: rootNodes.map(buildMindmapNode),
            data: {
              nodeId: roadmapId,
              videos: [],
            },
          };

    const totalDuration = roadmapWithNodes.total_duration || 0;
    const completedNodes = roadmapWithNodes.completed_nodes || 0;
    const totalNodes = roadmapWithNodes.total_nodes || 0;

    // Estimate completion time based on remaining nodes and average time per node
    const avgTimePerNode = totalNodes > 0 ? totalDuration / totalNodes : 0;
    const remainingNodes = totalNodes - completedNodes;
    const estimatedHours = Math.ceil((remainingNodes * avgTimePerNode) / 60);

    const estimatedCompletion =
      estimatedHours <= 24
        ? `${estimatedHours} hours`
        : `${Math.ceil(estimatedHours / 24)} days`;

    return {
      root,
      totalNodes,
      completedNodes,
      totalDuration,
      estimatedCompletion,
    };
  },
);
