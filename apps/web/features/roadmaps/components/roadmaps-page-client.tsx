"use client";

import { useState } from "react";
import { RoadmapList, RoadmapChatbox, RoadmapMindmap } from "./index";
import type { LearningRoadmap, RoadmapWithNodes } from "../types";

type RoadmapsPageClientProps = {
  initialRoadmaps: LearningRoadmap[];
};

export const RoadmapsPageClient = ({
  initialRoadmaps,
}: RoadmapsPageClientProps) => {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps);
  const [generatedRoadmap, setGeneratedRoadmap] =
    useState<RoadmapWithNodes | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRoadmapGenerated = (newRoadmap: RoadmapWithNodes) => {
    setGeneratedRoadmap(newRoadmap);
    // Add to the roadmaps list as well
    setRoadmaps((prev) => [newRoadmap, ...prev]);
  };

  const handleGenerationStart = () => {
    setIsGenerating(true);
    setGeneratedRoadmap(null);
  };

  const handleGenerationEnd = () => {
    setIsGenerating(false);
  };

  // Use roadmaps directly since new ones are already added to the state
  const displayRoadmaps = roadmaps;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          {/* Left Side - Roadmap List (Fixed) */}
          <div className="lg:col-span-1 flex flex-col h-full max-h-screen">
            <div className="flex-shrink-0 mb-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Learning Roadmaps
              </h1>
            </div>

            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Roadmap List - Scrollable */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <RoadmapList roadmaps={roadmaps} />
              </div>

              {/* Chatbox - Fixed at bottom */}
              <div className="flex-shrink-0">
                <RoadmapChatbox
                  onGenerationStart={handleGenerationStart}
                  onGenerationEnd={handleGenerationEnd}
                  onRoadmapGenerated={handleRoadmapGenerated}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Mindmap Visualization */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg border h-full flex flex-col">
              <div className="p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Roadmap Mindmap
                  {isGenerating && (
                    <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                      (Generating...)
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <RoadmapMindmap
                  roadmaps={displayRoadmaps}
                  isGenerating={isGenerating}
                  generatedRoadmap={generatedRoadmap}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
