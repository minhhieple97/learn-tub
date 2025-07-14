import {
  AI_SYSTEM_MESSAGES,
} from "@/config/constants";
import type {
  GenerateRoadmapRequest,
  RoadmapGenerationResult,
  YouTubeSearchResult,
  RoadmapWithNodes,
} from "../types";
import { aiUsageTracker } from "@/features/ai";
import { AIClientFactory } from "@/features/ai/services/ai-client";
import { createClient } from "@/lib/supabase/server";
import {
  createRoadmap,
  createRoadmapNode,
  addVideoToNode,
  createRoadmapInteraction,
  getRoadmapWithNodes,
} from "../queries";

// YouTube duration parsing utility
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
};

class RoadmapService {
  /**
   * Generate a learning roadmap using AI
   */
  async generateRoadmap(
    request: GenerateRoadmapRequest,
    userId: string,
    aiModelId: string,
  ): Promise<RoadmapGenerationResult> {
    console.log("🤖 [RoadmapService] generateRoadmap called with:", {
      skill: request.skill,
      userId,
      aiModelId,
    });

    const prompt = this.createRoadmapGenerationPrompt(request);
    console.log("📝 [RoadmapService] Generated prompt length:", prompt.length);

    const supabase = await createClient();
    console.log("🔍 [RoadmapService] Looking up AI model...");
    const { data: modelData, error: modelError } = await supabase
      .from("ai_model_pricing_view")
      .select("model_name")
      .eq("id", aiModelId)
      .single();

    if (modelError || !modelData?.model_name) {
      console.error("💥 [RoadmapService] Unsupported AI model:", {
        aiModelId,
        modelError,
      });
      throw new Error(`Unsupported AI model: ${aiModelId}`);
    }

    const modelName = modelData.model_name;
    console.log("✅ [RoadmapService] Using AI model:", modelName);

    console.log("💬 [RoadmapService] Calling AI for roadmap generation...");
    const response = await aiUsageTracker.wrapAIOperationWithTokens(
      {
        user_id: userId,
        command: "generate_roadmap" as any, // This would need to be added to AI_COMMANDS
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { result, tokenUsage } = await aiClient.chatCompletionWithUsage({
          model: modelName,
          messages,
        });

        return {
          result,
          tokenUsage,
        };
      },
    );

    console.log("✅ [RoadmapService] AI response received, parsing...");
    const parsedResult = this.parseRoadmapFromResponse(response);

    console.log("📋 [RoadmapService] Parsed roadmap structure:", {
      title: parsedResult.roadmap.title,
      nodeCount: parsedResult.nodes.length,
      estimatedDuration: parsedResult.roadmap.estimatedDuration,
    });

    return parsedResult;
  }

  /**
   * Search YouTube videos for a given query
   */
  async searchYouTubeVideos(
    query: string,
    options: {
      maxResults?: number;
      order?: "relevance" | "date" | "viewCount";
      videoDuration?: "short" | "medium" | "long";
    } = {},
  ): Promise<YouTubeSearchResult[]> {
    const {
      maxResults = 5,
      order = "relevance",
      videoDuration = "medium",
    } = options;

    console.log("🎬 [RoadmapService] searchYouTubeVideos called:", {
      query,
      maxResults,
      order,
      videoDuration,
    });

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("💥 [RoadmapService] YouTube API key not configured");
      throw new Error("YouTube API key not configured");
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: maxResults.toString(),
      order,
      videoDuration,
      key: apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
    );

    if (!response.ok) {
      throw new Error("Failed to search YouTube videos");
    }

    const data = await response.json();

    // Get video durations with additional API call
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
    );

    const detailsData = await detailsResponse.json();
    const videoDetails = new Map<
      string,
      { duration: string; viewCount: number }
    >(
      detailsData.items.map((item: any) => [
        item.id,
        {
          duration: item.contentDetails.duration,
          viewCount: parseInt(item.statistics.viewCount || "0"),
        },
      ]),
    );

    return data.items.map((item: any, index: number) => {
      const details = videoDetails.get(item.id.videoId) || {
        duration: "PT0M",
        viewCount: 0,
      };
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelName: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        duration: details.duration,
        publishedAt: item.snippet.publishedAt,
        viewCount: details.viewCount,
        relevanceScore: 1 - index * 0.1, // Simple relevance scoring
      };
    });
  }

  /**
   * Create a complete roadmap from scratch with AI-generated content and YouTube videos
   */
  async generateCompleteRoadmapFromScratch(
    skillName: string,
    userPrompt: string,
    preferences: GenerateRoadmapRequest["preferences"],
    userId: string,
    aiModelId: string,
  ): Promise<RoadmapWithNodes> {
    console.log(
      "🎯 [RoadmapService] generateCompleteRoadmapFromScratch started",
    );
    console.log("📋 [RoadmapService] Parameters:", {
      skillName,
      userPrompt,
      preferences,
      userId,
      aiModelId,
    });

    // Create initial roadmap
    console.log("📝 [RoadmapService] Creating initial roadmap...");
    const roadmap = await createRoadmap({
      user_id: userId,
      skill_name: skillName,
      title: `Learn ${skillName}`,
      description: `AI-generated learning roadmap: ${userPrompt}`,
      status: "draft",
      ai_model_id: aiModelId,
      metadata: {
        preferences,
        generated_at: new Date().toISOString(),
      },
    });

    console.log("✅ [RoadmapService] Initial roadmap created:", {
      roadmapId: roadmap.id,
      title: roadmap.title,
      status: roadmap.status,
    });

    // Log AI interaction
    console.log("📊 [RoadmapService] Logging AI interaction...");
    await createRoadmapInteraction({
      roadmap_id: roadmap.id,
      user_id: userId,
      ai_model_id: aiModelId,
      interaction_type: "generate",
      input_data: { userPrompt, preferences },
    });

    try {
      // Generate roadmap structure with AI
      console.log(
        "🤖 [RoadmapService] Calling AI to generate roadmap structure...",
      );
      const generationResult = await this.generateRoadmap(
        {
          skill: skillName,
          userPrompt,
          preferences,
        },
        userId,
        aiModelId,
      );

      console.log("✅ [RoadmapService] AI generation completed:", {
        roadmapTitle: generationResult.roadmap.title,
        nodeCount: generationResult.nodes.length,
        estimatedDuration: generationResult.roadmap.estimatedDuration,
      });

      // Create nodes and search for videos (each node will be a YouTube video)
      console.log(
        "🔧 [RoadmapService] Creating nodes and searching for videos...",
      );
      const createdNodes = [];

      for (let i = 0; i < generationResult.nodes.length; i++) {
        const nodeData = generationResult.nodes[i];
        if (!nodeData) {
          console.warn(`⚠️ [RoadmapService] Missing node data at index ${i}`);
          continue;
        }

        console.log(
          `📝 [RoadmapService] Creating node ${i + 1}/${generationResult.nodes.length}:`,
          {
            title: nodeData.title,
            level: nodeData.level,
            order: nodeData.order,
          },
        );

        // Create node
        const node = await createRoadmapNode({
          roadmap_id: roadmap.id,
          title: nodeData.title,
          description: nodeData.description,
          order_index: nodeData.order,
          level: nodeData.level,
          parent_node_id:
            nodeData.parentIndex !== undefined
              ? createdNodes[nodeData.parentIndex]?.id || null
              : null,
          estimated_duration_minutes: nodeData.estimatedDuration,
          status: "pending",
        });

        createdNodes.push(node);
        console.log(`✅ [RoadmapService] Node created with ID: ${node.id}`);

        // Search and add ONE primary YouTube video for this node
        const searchQuery = `${skillName} ${nodeData.title} tutorial`;
        console.log(
          `🔍 [RoadmapService] Searching YouTube for: "${searchQuery}"`,
        );

        const videos = await this.searchYouTubeVideos(searchQuery, {
          maxResults: 1, // Only get one video per node
        });

        console.log(
          `📹 [RoadmapService] Found ${videos.length} videos for node "${nodeData.title}"`,
        );

        // Store video and link to node
        if (videos.length > 0) {
          const video = videos[0];
          if (video) {
            console.log(`📹 [RoadmapService] Processing video:`, {
              title: video.title,
              channel: video.channelName,
              duration: video.duration,
              videoId: video.videoId,
            });

            // Check if video already exists
            const supabase = await createClient();
            console.log(
              `🔍 [RoadmapService] Checking if video already exists in database...`,
            );
            const { data: existingVideo } = await supabase
              .from("videos")
              .select("id")
              .eq("youtube_id", video.videoId)
              .single();

            let videoId: string;

            if (existingVideo) {
              videoId = existingVideo.id;
              console.log(
                `♻️ [RoadmapService] Using existing video with ID: ${videoId}`,
              );
            } else {
              // Create new video entry
              console.log(`➕ [RoadmapService] Creating new video entry...`);
              const { data: newVideo, error: videoError } = await supabase
                .from("videos")
                .insert({
                  user_id: userId,
                  youtube_id: video.videoId,
                  title: video.title,
                  description: video.description,
                  channel_name: video.channelName,
                  thumbnail_url: video.thumbnailUrl,
                  duration: parseDuration(video.duration),
                  published_at: video.publishedAt,
                  discovered_via_roadmap: true,
                })
                .select()
                .single();

              if (videoError) {
                console.error(
                  "💥 [RoadmapService] Failed to create video:",
                  videoError,
                );
                continue;
              }

              videoId = newVideo.id;
              console.log(
                `✅ [RoadmapService] New video created with ID: ${videoId}`,
              );
            }

            // Link video to node as primary video
            console.log(`🔗 [RoadmapService] Linking video to node...`);
            await addVideoToNode({
              node_id: node.id,
              video_id: videoId,
              is_primary: true,
              order_index: 0,
              relevance_score: video.relevanceScore || 0.9,
            });
            console.log(
              `✅ [RoadmapService] Video linked to node successfully`,
            );
          }
        } else {
          console.warn(
            `⚠️ [RoadmapService] No videos found for node "${nodeData.title}"`,
          );
        }
      }

      // Update roadmap status and metadata
      console.log(
        "🔄 [RoadmapService] Updating roadmap status and metadata...",
      );
      const supabase = await createClient();
      const updatedRoadmap = await supabase
        .from("learning_roadmaps")
        .update({
          status: "active",
          title: generationResult.roadmap.title,
          description: generationResult.roadmap.description,
          metadata: {
            estimatedDuration: generationResult.roadmap.estimatedDuration,
            generatedAt: new Date().toISOString(),
            nodeCount: createdNodes.length,
            preferences,
          },
        })
        .eq("id", roadmap.id)
        .select()
        .single();

      if (updatedRoadmap.error) {
        console.error(
          "💥 [RoadmapService] Failed to update roadmap:",
          updatedRoadmap.error,
        );
        throw new Error("Failed to update roadmap");
      }

      console.log("✅ [RoadmapService] Roadmap updated successfully:", {
        roadmapId: roadmap.id,
        status: "active",
        nodeCount: createdNodes.length,
      });

      // Fetch the complete roadmap with nodes and videos
      console.log(
        "📚 [RoadmapService] Fetching complete roadmap with nodes and videos...",
      );
      const completeRoadmap = await getRoadmapWithNodes(roadmap.id, userId);

      if (!completeRoadmap) {
        console.error(
          "💥 [RoadmapService] Failed to fetch generated roadmap from database",
        );
        throw new Error("Failed to fetch generated roadmap");
      }

      console.log(
        "🎉 [RoadmapService] Complete roadmap fetched successfully:",
        {
          roadmapId: completeRoadmap.id,
          title: completeRoadmap.title,
          nodeCount: completeRoadmap.nodes?.length || 0,
          status: completeRoadmap.status,
        },
      );

      return completeRoadmap;
    } catch (error) {
      // If generation fails, clean up the roadmap
      console.error(
        "💥 [RoadmapService] Error occurred during roadmap generation:",
        error,
      );
      console.log("🧹 [RoadmapService] Cleaning up failed roadmap...");

      const supabase = await createClient();
      const { error: deleteError } = await supabase
        .from("learning_roadmaps")
        .delete()
        .eq("id", roadmap.id);

      if (deleteError) {
        console.error(
          "💥 [RoadmapService] Failed to clean up roadmap:",
          deleteError,
        );
      } else {
        console.log(
          "✅ [RoadmapService] Failed roadmap cleaned up successfully",
        );
      }

      throw error;
    }
  }

  /**
   * Create a complete roadmap with AI-generated content and YouTube videos
   */
  async createCompleteRoadmap(
    skillName: string,
    request: GenerateRoadmapRequest,
    userId: string,
    aiModelId: string,
  ): Promise<RoadmapWithNodes> {
    // Create initial roadmap
    const roadmap = await createRoadmap({
      user_id: userId,
      skill_name: skillName,
      title: `Learn ${skillName}`,
      description: `AI-generated learning roadmap for ${skillName}`,
      status: "draft",
      ai_model_id: aiModelId,
      metadata: {
        preferences: request.preferences,
        generated_at: new Date().toISOString(),
      },
    });

    // Log AI interaction
    await createRoadmapInteraction({
      roadmap_id: roadmap.id,
      user_id: userId,
      ai_model_id: aiModelId,
      interaction_type: "generate",
      input_data: request,
    });

    try {
      // Generate roadmap structure with AI
      const generationResult = await this.generateRoadmap(
        request,
        userId,
        aiModelId,
      );

      // Create nodes and search for videos
      const createdNodes = [];

      for (let i = 0; i < generationResult.nodes.length; i++) {
        const nodeData = generationResult.nodes[i];
        if (!nodeData) {
          console.warn(`Missing node data at index ${i}`);
          continue;
        }

        // Create node
        const node = await createRoadmapNode({
          roadmap_id: roadmap.id,
          title: nodeData.title,
          description: nodeData.description,
          order_index: nodeData.order,
          level: nodeData.level,
          parent_node_id:
            nodeData.parentIndex !== undefined
              ? createdNodes[nodeData.parentIndex]?.id || null
              : null,
          estimated_duration_minutes: nodeData.estimatedDuration,
          status: "pending",
        });

        createdNodes.push(node);

        // Search and add YouTube videos for this node
        const searchQuery = `${skillName} ${nodeData.title} tutorial`;
        const videos = await this.searchYouTubeVideos(searchQuery, {
          maxResults: 3,
        });

        // Store videos and link to node
        for (let j = 0; j < videos.length; j++) {
          const video = videos[j];
          if (!video) {
            console.warn(`Missing video data at index ${j}`);
            continue;
          }

          // Check if video already exists
          const supabase = await createClient();
          const { data: existingVideo } = await supabase
            .from("videos")
            .select("id")
            .eq("youtube_id", video.videoId)
            .single();

          let videoId: string;

          if (existingVideo) {
            videoId = existingVideo.id;
          } else {
            // Create new video entry
            const { data: newVideo, error: videoError } = await supabase
              .from("videos")
              .insert({
                user_id: userId,
                youtube_id: video.videoId,
                title: video.title,
                description: video.description,
                channel_name: video.channelName,
                thumbnail_url: video.thumbnailUrl,
                duration: parseDuration(video.duration),
                published_at: video.publishedAt,
                discovered_via_roadmap: true,
              })
              .select()
              .single();

            if (videoError) {
              console.error("Failed to create video:", videoError);
              continue;
            }

            videoId = newVideo.id;
          }

          // Link video to node
          await addVideoToNode({
            node_id: node.id,
            video_id: videoId,
            is_primary: j === 0,
            order_index: j,
            relevance_score: video.relevanceScore || 0.8,
          });
        }
      }

      // Update roadmap status and metadata
      const supabase = await createClient();
      await supabase
        .from("learning_roadmaps")
        .update({
          status: "active",
          title: generationResult.roadmap.title,
          description: generationResult.roadmap.description,
          metadata: {
            estimatedDuration: generationResult.roadmap.estimatedDuration,
            generatedAt: new Date().toISOString(),
            nodeCount: createdNodes.length,
            preferences: request.preferences,
          },
        })
        .eq("id", roadmap.id);

      // Return updated roadmap with nodes (this would need to be fetched)
      return {
        ...roadmap,
        title: generationResult.roadmap.title,
        description: generationResult.roadmap.description,
        status: "active",
        nodes: [], // Would need to fetch with full details
        total_nodes: createdNodes.length,
        completed_nodes: 0,
        total_duration: generationResult.roadmap.estimatedDuration,
      };
    } catch (error) {
      // If generation fails, clean up the roadmap
      const supabase = await createClient();
      await supabase.from("learning_roadmaps").delete().eq("id", roadmap.id);

      throw error;
    }
  }

  /**
   * Create the prompt for roadmap generation
   */
  private createRoadmapGenerationPrompt(
    request: GenerateRoadmapRequest,
  ): string {
    const { skill, userPrompt, preferences } = request;

    const contextInfo = this.buildPreferencesContext(preferences);

    return `You are an educational expert creating a comprehensive learning roadmap. Create a structured learning path for the skill: "${skill}".

## User Request:
"${userPrompt}"

${contextInfo}

## Instructions:
Create a learning roadmap with 5-10 learning nodes organized hierarchically. Each node should represent a key concept or skill area that builds upon previous knowledge.

## Required Response Format (JSON):
{
  "roadmap": {
    "title": "Clear, engaging title for the roadmap",
    "description": "2-3 sentence overview of what the learner will achieve",
    "estimatedDuration": number (total estimated minutes for the entire roadmap)
  },
  "nodes": [
    {
      "title": "Node title (clear and specific)",
      "description": "1-2 sentence description of what this node covers",
      "level": number (0 for root concepts, 1 for main topics, 2+ for subtopics),
      "parentIndex": number (optional, index of parent node in this array),
      "estimatedDuration": number (estimated minutes for this specific node),
      "order": number (sequential order within the same level)
    }
  ]
}

## Guidelines:
- Start with foundational concepts (level 0)
- Build complexity gradually through levels
- Ensure each node has clear learning objectives
- Balance theoretical understanding with practical application
- Consider the user's specified preferences and experience level
- Make the roadmap actionable and achievable
- Provide realistic time estimates based on typical learning speeds

Generate a well-structured, progressive learning path that will effectively guide the learner from beginner to competent in ${skill}.`;
  }

  /**
   * Build context information from user preferences
   */
  private buildPreferencesContext(
    preferences?: GenerateRoadmapRequest["preferences"],
  ): string {
    if (!preferences) return "";

    const contextParts: string[] = [];

    if (preferences.difficulty) {
      contextParts.push(`**Experience Level**: ${preferences.difficulty}`);
    }

    if (preferences.timeCommitment) {
      const timeMapping = {
        low: "1-2 hours per week",
        medium: "3-5 hours per week",
        high: "6+ hours per week",
      };
      contextParts.push(
        `**Time Commitment**: ${timeMapping[preferences.timeCommitment]}`,
      );
    }

    if (preferences.learningStyle) {
      const styleMapping = {
        visual: "Prefers visual learning with diagrams, videos, and examples",
        practical: "Learns best through hands-on practice and projects",
        theoretical:
          "Enjoys deep conceptual understanding and structured theory",
      };
      contextParts.push(
        `**Learning Style**: ${styleMapping[preferences.learningStyle]}`,
      );
    }

    if (preferences.focusAreas && preferences.focusAreas.length > 0) {
      contextParts.push(
        `**Focus Areas**: ${preferences.focusAreas.join(", ")}`,
      );
    }

    if (contextParts.length === 0) return "";

    return `\n## Learner Profile:\n${contextParts.join("\n")}\n`;
  }

  /**
   * Parse the AI response into a structured roadmap result
   */
  private parseRoadmapFromResponse(
    responseText: string,
  ): RoadmapGenerationResult {
    try {
      let cleanedText = responseText.trim();

      // Remove markdown code block markers if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "");
      }
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "");
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.replace(/\s*```$/, "");
      }

      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText);

      // Validate the structure
      if (!parsed.roadmap || !parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error("Invalid roadmap response format");
      }

      // Ensure all required fields are present
      const roadmap = {
        title: parsed.roadmap.title || "Learning Roadmap",
        description: parsed.roadmap.description || "AI-generated learning path",
        estimatedDuration: parsed.roadmap.estimatedDuration || 0,
      };

      const nodes = parsed.nodes.map((node: any, index: number) => ({
        title: node.title || `Learning Node ${index + 1}`,
        description: node.description || "",
        level: node.level || 0,
        parentIndex: node.parentIndex,
        estimatedDuration: node.estimatedDuration || 60,
        order: node.order !== undefined ? node.order : index,
        suggestedVideos: [], // Will be populated by video search
      }));

      return {
        roadmap,
        nodes,
      };
    } catch (error) {
      console.error("Failed to parse roadmap response:", error);
      console.error("Original response text:", responseText);
      throw new Error("Failed to parse AI response into roadmap structure");
    }
  }
}

export const roadmapService = new RoadmapService();
