"use server";

import { z } from "zod";
import { authAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import {
  createRoadmapInputSchema,
  updateRoadmapInputSchema,
  deleteRoadmapInputSchema,
  generateRoadmapRequestSchema,
  updateRoadmapProgressSchema,
  createRoadmapNodeSchema,
  updateRoadmapNodeSchema,
  deleteRoadmapNodeSchema,
  addVideoToNodeSchema,
  removeVideoFromNodeSchema,
} from "../schemas";
import {
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getRoadmapById,
  createRoadmapNode,
  updateRoadmapNode,
  deleteRoadmapNode,
  addVideoToNode,
  removeVideoFromNode,
  updateNodeProgress,
  markNodeCompleted,
} from "../queries";
import { roadmapService } from "../services";

/**
 * Create a new learning roadmap
 */
export const createRoadmapAction = authAction
  .inputSchema(createRoadmapInputSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const roadmap = await createRoadmap({
      user_id: user.id,
      skill_name: parsedInput.skill_name,
      title: parsedInput.title || `Learn ${parsedInput.skill_name}`,
      description: parsedInput.description,
      status: "draft",
      metadata: {
        created_via: "manual",
        created_at: new Date().toISOString(),
      },
    });

    revalidatePath("/roadmaps");

    return {
      success: true,
      roadmapId: roadmap.id,
    };
  });

/**
 * Update an existing roadmap
 */
export const updateRoadmapAction = authAction
  .inputSchema(updateRoadmapInputSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await updateRoadmap(parsedInput.roadmapId, user.id, {
      title: parsedInput.title,
      description: parsedInput.description,
      status: parsedInput.status,
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${parsedInput.roadmapId}`);

    return {
      success: true,
    };
  });

/**
 * Delete a roadmap
 */
export const deleteRoadmapAction = authAction
  .inputSchema(deleteRoadmapInputSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await deleteRoadmap(parsedInput.roadmapId, user.id);

    revalidatePath("/roadmaps");

    return {
      success: true,
    };
  });

/**
 * Generate a complete roadmap with AI
 */
const generateRoadmapWithAiModelSchema = generateRoadmapRequestSchema.extend({
  aiModelId: z.string().uuid("Invalid AI model ID"),
});

export const generateRoadmapAction = authAction
  .inputSchema(generateRoadmapWithAiModelSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // Check if roadmap exists and belongs to user
    const existingRoadmap = await getRoadmapById(
      parsedInput.roadmapId,
      user.id,
    );
    if (!existingRoadmap) {
      throw new Error("Roadmap not found");
    }

    const roadmapWithNodes = await roadmapService.createCompleteRoadmap(
      parsedInput.skill,
      parsedInput,
      user.id,
      parsedInput.aiModelId,
    );

    revalidatePath("/roadmaps");
    revalidatePath(`/roadmaps/${parsedInput.roadmapId}`);

    return {
      success: true,
      roadmapId: roadmapWithNodes.id,
    };
  });

/**
 * Update progress for roadmap nodes
 */
export const updateRoadmapProgressAction = authAction
  .inputSchema(updateRoadmapProgressSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // Process each progress update
    for (const update of parsedInput.updates) {
      await updateNodeProgress(update.nodeId, user.id, parsedInput.roadmapId, {
        time_spent_minutes: update.timeSpentMinutes,
        notes: update.notes,
      });

      // If status is completed, mark the node as completed
      if (update.status === "completed") {
        await markNodeCompleted(update.nodeId, user.id, parsedInput.roadmapId);
      } else {
        // Update node status
        await updateRoadmapNode(update.nodeId, {
          status: update.status,
          updated_at: new Date().toISOString(),
        });
      }
    }

    revalidatePath(`/roadmaps/${parsedInput.roadmapId}`);

    return {
      success: true,
    };
  });

/**
 * Create a new roadmap node
 */
export const createRoadmapNodeAction = authAction
  .inputSchema(createRoadmapNodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // Verify roadmap ownership
    const roadmap = await getRoadmapById(parsedInput.roadmapId, user.id);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const node = await createRoadmapNode({
      roadmap_id: parsedInput.roadmapId,
      title: parsedInput.title,
      description: parsedInput.description,
      level: parsedInput.level,
      order_index: parsedInput.orderIndex,
      parent_node_id: parsedInput.parentNodeId,
      estimated_duration_minutes: parsedInput.estimatedDurationMinutes,
      status: "pending",
    });

    revalidatePath(`/roadmaps/${parsedInput.roadmapId}`);

    return {
      success: true,
      nodeId: node.id,
    };
  });

/**
 * Update a roadmap node
 */
export const updateRoadmapNodeAction = authAction
  .inputSchema(updateRoadmapNodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await updateRoadmapNode(parsedInput.nodeId, {
      title: parsedInput.title,
      description: parsedInput.description,
      status: parsedInput.status,
      estimated_duration_minutes: parsedInput.estimatedDurationMinutes,
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/roadmaps");

    return {
      success: true,
    };
  });

/**
 * Delete a roadmap node
 */
export const deleteRoadmapNodeAction = authAction
  .inputSchema(deleteRoadmapNodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await deleteRoadmapNode(parsedInput.nodeId);

    revalidatePath("/roadmaps");

    return {
      success: true,
    };
  });

/**
 * Add a video to a roadmap node
 */
export const addVideoToNodeAction = authAction
  .inputSchema(addVideoToNodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await addVideoToNode({
      node_id: parsedInput.nodeId,
      video_id: parsedInput.videoId,
      is_primary: parsedInput.isPrimary,
      order_index: parsedInput.orderIndex,
      relevance_score: parsedInput.relevanceScore,
    });

    revalidatePath("/roadmaps");

    return {
      success: true,
    };
  });

/**
 * Remove a video from a roadmap node
 */
export const removeVideoFromNodeAction = authAction
  .inputSchema(removeVideoFromNodeSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    await removeVideoFromNode(parsedInput.nodeId, parsedInput.videoId);

    revalidatePath("/roadmaps");

    return {
      success: true,
    };
  });

/**
 * Generate a complete roadmap with AI in one step
 */
const generateCompleteRoadmapRequestSchema = z.object({
  userPrompt: z
    .string()
    .min(10, "Please provide more details")
    .max(2000, "Prompt too long"),
  aiModelId: z.string().uuid("Invalid AI model ID"),
});

export const generateCompleteRoadmapAction = authAction
  .inputSchema(generateCompleteRoadmapRequestSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    console.log(
      "🚀 [generateCompleteRoadmapAction] Starting roadmap generation...",
    );
    console.log("📝 [generateCompleteRoadmapAction] Input:", {
      userPrompt: parsedInput.userPrompt,
      aiModelId: parsedInput.aiModelId,
      userId: user.id,
    });

    // Extract skill name from prompt (simple approach)
    const extractSkillFromMessage = (msg: string): string => {
      const patterns = [
        /(?:learn|study|master|understand)\s+(.+?)(?:\s|$)/i,
        /(?:want to|how to)\s+(.+?)(?:\s|$)/i,
        /(.+?)(?:\s+tutorial|\s+course|\s+training)?$/i,
      ];

      for (const pattern of patterns) {
        const match = msg.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      return msg.slice(0, 50); // Fallback to first 50 chars
    };

    const skillName = extractSkillFromMessage(parsedInput.userPrompt);
    console.log(
      "🎯 [generateCompleteRoadmapAction] Extracted skill name:",
      skillName,
    );

    // Ensure we have a valid skill name
    if (!skillName || skillName.trim().length === 0) {
      console.error(
        "❌ [generateCompleteRoadmapAction] Invalid skill name extracted",
      );
      throw new Error(
        "Unable to extract skill from your message. Please be more specific about what you want to learn.",
      );
    }

    const preferences = {
      difficulty: "beginner" as const,
      timeCommitment: "medium" as const,
      learningStyle: "visual" as const,
      focusAreas: [] as string[],
    };

    console.log(
      "⚙️ [generateCompleteRoadmapAction] Using preferences:",
      preferences,
    );

    try {
      console.log(
        "🔄 [generateCompleteRoadmapAction] Calling roadmapService.generateCompleteRoadmapFromScratch...",
      );

      // Create the complete roadmap with nodes and videos
      const roadmapWithNodes =
        await roadmapService.generateCompleteRoadmapFromScratch(
          skillName,
          parsedInput.userPrompt,
          preferences,
          user.id,
          parsedInput.aiModelId,
        );

      console.log(
        "✅ [generateCompleteRoadmapAction] Roadmap generation completed successfully!",
      );
      console.log("📊 [generateCompleteRoadmapAction] Result:", {
        roadmapId: roadmapWithNodes.id,
        title: roadmapWithNodes.title,
        nodeCount: roadmapWithNodes.nodes?.length || 0,
        status: roadmapWithNodes.status,
      });

      revalidatePath("/roadmaps");
      console.log(
        "🔄 [generateCompleteRoadmapAction] Revalidated /roadmaps path",
      );

      return {
        success: true,
        roadmap: roadmapWithNodes,
      };
    } catch (error) {
      console.error(
        "💥 [generateCompleteRoadmapAction] Error during roadmap generation:",
        error,
      );
      throw error;
    }
  });
