"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { getRoadmapWithNodesAction } from "@/features/roadmaps/actions";
import type {
  LearningRoadmap,
  RoadmapWithNodes,
} from "@/features/roadmaps/types";

type UseRoadmapsPageProps = {
  initialRoadmaps: LearningRoadmap[];
};

export const useRoadmapsPage = ({ initialRoadmaps }: UseRoadmapsPageProps) => {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
  const [selectedRoadmap, setSelectedRoadmap] =
    useState<RoadmapWithNodes | null>(null);
  const [generatedRoadmap, setGeneratedRoadmap] =
    useState<RoadmapWithNodes | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingRoadmapId, setLoadingRoadmapId] = useState<string | null>(null);

  const { execute: fetchRoadmapDetails, isExecuting: isFetchingDetails } =
    useAction(getRoadmapWithNodesAction, {
      onExecute: ({ input }) => {
        setLoadingRoadmapId(input.roadmapId);
      },
      onSuccess: ({ data }) => {
        if (data?.roadmap) {
          setSelectedRoadmap(data.roadmap);
        }
        setLoadingRoadmapId(null);
      },
      onError: ({ error }) => {
        console.error("Failed to fetch roadmap details:", error);
        setLoadingRoadmapId(null);
      },
    });

  // Auto-select latest roadmap when roadmaps are available
  useEffect(() => {
    if (roadmaps.length > 0 && !selectedRoadmap && !generatedRoadmap) {
      const latestRoadmap = roadmaps[0];
      if (latestRoadmap) {
        fetchRoadmapDetails({ roadmapId: latestRoadmap.id });
      }
    }
  }, [roadmaps, selectedRoadmap, generatedRoadmap, fetchRoadmapDetails]);

  const handleRoadmapSelect = useCallback(
    (roadmap: LearningRoadmap) => {
      setGeneratedRoadmap(null);
      fetchRoadmapDetails({ roadmapId: roadmap.id });
    },
    [fetchRoadmapDetails],
  );

  const handleRoadmapGenerated = useCallback((newRoadmap: RoadmapWithNodes) => {
    setGeneratedRoadmap(newRoadmap);
    setSelectedRoadmap(null);
    setRoadmaps((prev) => [newRoadmap, ...prev]);
    setLoadingRoadmapId(null);
  }, []);

  const handleGenerationStart = useCallback(() => {
    setIsGenerating(true);
    setGeneratedRoadmap(null);
  }, []);

  const handleGenerationEnd = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const handleBackToOverview = useCallback(() => {
    setGeneratedRoadmap(null);
    setSelectedRoadmap(null);
    setLoadingRoadmapId(null);
  }, []);

  const displayedRoadmap = generatedRoadmap || selectedRoadmap;

  return {
    // State
    roadmaps,
    selectedRoadmap,
    generatedRoadmap,
    displayedRoadmap,
    isGenerating,
    isFetchingDetails,
    loadingRoadmapId,

    // Actions
    handleRoadmapSelect,
    handleRoadmapGenerated,
    handleGenerationStart,
    handleGenerationEnd,
    handleBackToOverview,
  };
};
