"use client";

import { useState, useEffect } from "react";
import { useMindmapLayout } from "@/features/roadmaps/hooks/use-mindmap-layout";
import type { LearningRoadmap, RoadmapWithNodes } from "../types";
import { EmptyState, LoadingState, MindmapRenderer } from "./mindmap";

type IRoadmapMindmapProps = {
  roadmaps: LearningRoadmap[];
  isGenerating?: boolean;
  generatedRoadmap?: RoadmapWithNodes;
  selectedRoadmap?: RoadmapWithNodes | null;
};

export const RoadmapMindmap = ({
  roadmaps,
  isGenerating,
  generatedRoadmap,
  selectedRoadmap,
}: IRoadmapMindmapProps) => {
  const [mounted, setMounted] = useState(false);

  const { nodes, edges } = useMindmapLayout({
    roadmaps,
    generatedRoadmap,
    selectedRoadmap,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingState />;
  }

  // Show loading state while generating
  if (isGenerating) {
    return <LoadingState isGenerating />;
  }

  // Show empty state only if no roadmaps exist
  if (roadmaps.length === 0 && !generatedRoadmap) {
    return <EmptyState />;
  }

  // Always render the mindmap - it will show latest roadmap, selected roadmap, or node details
  return <MindmapRenderer nodes={nodes} edges={edges} />;
};
