"use client";

import { useState, useEffect } from "react";
import { useMindmapLayout } from '@/features/roadmaps/hooks/use-mindmap-layout';
import type { LearningRoadmap, RoadmapWithNodes } from "../types";
import { EmptyState, LoadingState, MindmapRenderer } from "./mindmap";

type RoadmapMindmapProps = {
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
}: RoadmapMindmapProps) => {
  const [mounted, setMounted] = useState(false);

  const { nodes, edges, shouldShowNodeLayout } = useMindmapLayout({
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

  if (roadmaps.length === 0 && !isGenerating && !shouldShowNodeLayout) {
    return <EmptyState />;
  }

  if (isGenerating && roadmaps.length === 0) {
    return <LoadingState isGenerating />;
  }

  return <MindmapRenderer nodes={nodes} edges={edges} />;
};
