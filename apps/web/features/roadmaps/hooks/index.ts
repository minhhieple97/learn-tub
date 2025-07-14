"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type {
  LearningRoadmap,
  RoadmapWithNodes,
  RoadmapProgressSummary,
  MindmapData,
  CreateRoadmapFormData,
  GenerateRoadmapRequest,
  NodeProgressUpdate,
  UseRoadmapReturn,
  UseRoadmapListReturn,
  UseRoadmapProgressReturn,
} from "../types";
import {
  createRoadmapAction,
  updateRoadmapAction,
  deleteRoadmapAction,
  generateRoadmapAction,
  updateRoadmapProgressAction,
} from "../actions";

/**
 * Hook for managing a single roadmap
 */
export const useRoadmap = (roadmapId?: string): UseRoadmapReturn => {
  const [roadmap, setRoadmap] = useState<RoadmapWithNodes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    if (!roadmapId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch roadmap");
      }

      setRoadmap(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch roadmap";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId]);

  const refetch = useCallback(async () => {
    await fetchRoadmap();
  }, [fetchRoadmap]);

  // Initial fetch on mount or roadmapId change
  useState(() => {
    fetchRoadmap();
  });

  return {
    roadmap,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for managing roadmap list
 */
export const useRoadmapList = (): UseRoadmapListReturn => {
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roadmaps");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch roadmaps");
      }

      setRoadmaps(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch roadmaps";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchRoadmaps();
  }, [fetchRoadmaps]);

  // Initial fetch on mount
  useState(() => {
    fetchRoadmaps();
  });

  return {
    roadmaps,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for creating roadmaps
 */
export const useCreateRoadmap = () => {
  const router = useRouter();
  const { execute, result, isExecuting } = useAction(createRoadmapAction, {
    onSuccess: ({ data }) => {
      if (data?.roadmapId) {
        toast.success("Roadmap created successfully!");
        router.push(`/roadmaps/${data.roadmapId}`);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to create roadmap");
    },
  });

  const createRoadmap = useCallback(
    (formData: CreateRoadmapFormData) => {
      execute({
        skill_name: formData.skillName,
        title: formData.title,
        description: formData.description,
      });
    },
    [execute],
  );

  return {
    createRoadmap,
    isPending: isExecuting,
    result,
  };
};

/**
 * Hook for roadmap generation with AI
 */
export const useRoadmapGeneration = () => {
  const { execute, result, isExecuting, reset } = useAction(
    generateRoadmapAction,
    {
      onSuccess: ({ data }) => {
        toast.success("Roadmap generated successfully!");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to generate roadmap");
      },
    },
  );

  const generateRoadmap = useCallback(
    (
      request: GenerateRoadmapRequest & {
        roadmapId: string;
        aiModelId: string;
      },
    ) => {
      execute(request);
    },
    [execute],
  );

  return {
    generateRoadmap,
    isGenerating: isExecuting,
    result: result?.data,
    error: result?.serverError,
    reset,
  };
};

/**
 * Hook for updating roadmap progress
 */
export const useRoadmapProgress = (
  roadmapId: string,
): UseRoadmapProgressReturn => {
  const [progress, setProgress] = useState<RoadmapProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
    updateRoadmapProgressAction,
    {
      onSuccess: () => {
        toast.success("Progress updated successfully!");
        // Refresh progress data
        fetchProgress();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to update progress");
      },
    },
  );

  const fetchProgress = useCallback(async () => {
    if (!roadmapId) return;

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}/progress`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch progress");
      }

      setProgress(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch progress";
      setError(errorMessage);
      console.error("Fetch progress error:", err);
    }
  }, [roadmapId]);

  const updateProgress = useCallback(
    async (update: NodeProgressUpdate) => {
      executeUpdate({
        roadmapId,
        updates: [update],
      });
    },
    [roadmapId, executeUpdate],
  );

  // Initial fetch on mount
  useState(() => {
    fetchProgress();
  });

  return {
    progress,
    updateProgress,
    isUpdating,
    error,
  };
};

/**
 * Hook for roadmap operations (update, delete)
 */
export const useRoadmapOperations = () => {
  const router = useRouter();

  const { execute: executeUpdate, isExecuting: isUpdating } = useAction(
    updateRoadmapAction,
    {
      onSuccess: () => {
        toast.success("Roadmap updated successfully!");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to update roadmap");
      },
    },
  );

  const { execute: executeDelete, isExecuting: isDeleting } = useAction(
    deleteRoadmapAction,
    {
      onSuccess: () => {
        toast.success("Roadmap deleted successfully!");
        router.push("/roadmaps");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Failed to delete roadmap");
      },
    },
  );

  const updateRoadmap = useCallback(
    (
      roadmapId: string,
      updates: {
        title?: string;
        description?: string;
        status?: "draft" | "active" | "completed" | "archived";
      },
    ) => {
      executeUpdate({
        roadmapId,
        ...updates,
      });
    },
    [executeUpdate],
  );

  const deleteRoadmap = useCallback(
    (roadmapId: string) => {
      executeDelete({ roadmapId });
    },
    [executeDelete],
  );

  return {
    updateRoadmap,
    deleteRoadmap,
    isPending: isUpdating || isDeleting,
  };
};

/**
 * Hook for mindmap data
 */
export const useMindmapData = (roadmapId?: string) => {
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMindmapData = useCallback(async () => {
    if (!roadmapId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}/mindmap`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch mindmap data");
      }

      setMindmapData(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch mindmap data";
      setError(errorMessage);
      console.error("Fetch mindmap data error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId]);

  const refetch = useCallback(async () => {
    await fetchMindmapData();
  }, [fetchMindmapData]);

  // Initial fetch on mount or roadmapId change
  useState(() => {
    fetchMindmapData();
  });

  return {
    mindmapData,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for AI model selection in roadmap generation
 */
export const useAIModelSelection = () => {
  const [provider, setProvider] = useState<string | null>(null);
  const [aiModelId, setAiModelId] = useState<string>("");

  const handleProviderChange = useCallback((newProvider: string) => {
    setProvider(newProvider);
    // Reset model when provider changes
    setAiModelId("");
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setAiModelId(modelId);
  }, []);

  return {
    provider,
    aiModelId,
    handleProviderChange,
    handleModelChange,
  };
};

// Export the new hook
export * from "./use-default-ai-model";
