"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import type { LearningRoadmap } from "../types";

type RoadmapListProps = {
  roadmaps: LearningRoadmap[];
};

export const RoadmapList = ({ roadmaps }: RoadmapListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "archived":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
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
      {roadmaps.map((roadmap) => (
        <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                  {roadmap.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`ml-2 ${getStatusColor(roadmap.status ?? "draft")}`}
                >
                  {roadmap.status ?? "draft"}
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
        </Link>
      ))}
    </div>
  );
};
