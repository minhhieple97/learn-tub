"use client";

import { RoadmapEmptyState } from './roadmap-empty-state';
import { RoadmapCard } from './roadmap-card';
import type { LearningRoadmap } from "../types";

type RoadmapListProps = {
  roadmaps: LearningRoadmap[];
  onRoadmapSelect?: (roadmap: LearningRoadmap) => void;
  selectedRoadmapId?: string;
  loadingRoadmapId?: string | null;
  isLoading?: boolean;
};

export const RoadmapList = ({
  roadmaps,
  onRoadmapSelect,
  selectedRoadmapId,
  loadingRoadmapId,
  isLoading = false,
}: RoadmapListProps) => {
  const handleRoadmapSelect = (roadmap: LearningRoadmap) => {
    if (onRoadmapSelect && !isLoading) {
      onRoadmapSelect(roadmap);
    }
  };

  if (roadmaps.length === 0) {
    return <RoadmapEmptyState />;
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2">
      {roadmaps.map((roadmap) => {
        const isSelected = selectedRoadmapId === roadmap.id;
        const isRoadmapLoading = loadingRoadmapId
          ? loadingRoadmapId === roadmap.id
          : isSelected && isLoading;

        return (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            isSelected={isSelected}
            isLoading={isRoadmapLoading}
            onSelect={handleRoadmapSelect}
            disabled={isLoading}
          />
        );
      })}
    </div>
  );
};
