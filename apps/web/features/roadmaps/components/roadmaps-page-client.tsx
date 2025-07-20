"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRoadmapsPage } from "@/features/roadmaps/hooks/use-roadmaps-page";
import { RoadmapList, RoadmapChatbox, RoadmapMindmap } from "./index";
import type { LearningRoadmap } from "../types";

type IRoadmapsPageClientProps = {
  initialRoadmaps: LearningRoadmap[];
};

export const RoadmapsPageClient = ({
  initialRoadmaps,
}: IRoadmapsPageClientProps) => {
  const {
    roadmaps,
    selectedRoadmap,
    generatedRoadmap,
    displayedRoadmap,
    isGenerating,
    isFetchingDetails,
    handleRoadmapSelect,
    handleRoadmapGenerated,
    handleGenerationStart,
    handleGenerationEnd,
  } = useRoadmapsPage({ initialRoadmaps });

  const getHeaderTitle = () => {
    if (!displayedRoadmap) {
      return "Roadmap Mindmap";
    }

    let title = displayedRoadmap.title;

    if (isGenerating) {
      title += " (Generating...)";
    } else if (isFetchingDetails) {
      title += " (Loading...)";
    }

    return title;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          <div className="lg:col-span-1 flex flex-col h-full max-h-screen">
            <div className="flex-shrink-0 mb-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Learning Roadmaps
              </h1>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="flex-1 min-h-0 overflow-hidden">
                <RoadmapList
                  roadmaps={roadmaps}
                  onRoadmapSelect={handleRoadmapSelect}
                  selectedRoadmapId={displayedRoadmap?.id}
                  isLoading={isFetchingDetails}
                />
              </div>

              <div className="flex-shrink-0">
                <RoadmapChatbox
                  onGenerationStart={handleGenerationStart}
                  onGenerationEnd={handleGenerationEnd}
                  onRoadmapGenerated={handleRoadmapGenerated}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 h-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg border h-full flex flex-col">
              <div className="p-4 border-b flex-shrink-0 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {getHeaderTitle()}
                </h2>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <RoadmapMindmap
                  roadmaps={roadmaps}
                  isGenerating={isGenerating}
                  generatedRoadmap={generatedRoadmap || undefined}
                  selectedRoadmap={selectedRoadmap || undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
