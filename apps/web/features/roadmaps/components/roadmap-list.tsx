"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { getStatusColor, formatDate } from '../utils';
import type { LearningRoadmap } from "../types";

type RoadmapListProps = {
  roadmaps: LearningRoadmap[];
  onRoadmapSelect?: (roadmap: LearningRoadmap) => void;
  selectedRoadmapId?: string;
  isLoading?: boolean;
};

export const RoadmapList = ({
  roadmaps,
  onRoadmapSelect,
  selectedRoadmapId,
  isLoading = false,
}: RoadmapListProps) => {
  const handleRoadmapClick = (roadmap: LearningRoadmap) => {
    if (onRoadmapSelect && !isLoading) {
      onRoadmapSelect(roadmap);
    }
  };

  if (roadmaps.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
        <p className="text-slate-600 dark:text-slate-300">
          Use the chat below to create your first learning roadmap.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-2">
      {roadmaps.map((roadmap) => {
        const isSelected = selectedRoadmapId === roadmap.id;

        return (
          <Card
            key={roadmap.id}
            className={`transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-slate-600 dark:ring-blue-400'
                : 'hover:shadow-md hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500'
            } ${isLoading ? 'opacity-50' : ''}`}
            onClick={() => handleRoadmapClick(roadmap)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-sm line-clamp-2 flex-1 text-slate-900 dark:text-slate-100">
                    {roadmap.title}
                  </h3>
                  {isLoading && isSelected && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  <Link href={`/roadmaps/${roadmap.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      title="Open in full page"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-2 ${getStatusColor(roadmap.status ?? 'draft')}`}
                >
                  {roadmap.status ?? 'draft'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{roadmap.skill_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(roadmap.created_at)}</span>
                </div>
              </div>

              {roadmap.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                  {roadmap.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
