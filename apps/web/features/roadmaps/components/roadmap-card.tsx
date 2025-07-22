import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { getStatusColor, formatDate } from "../utils";
import type { LearningRoadmap } from "../types";

type RoadmapCardProps = {
  roadmap: LearningRoadmap;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (roadmap: LearningRoadmap) => void;
  disabled?: boolean;
};

export const RoadmapCard = ({
  roadmap,
  isSelected,
  isLoading,
  onSelect,
  disabled = false,
}: RoadmapCardProps) => {
  const handleClick = () => {
    if (!disabled && !isLoading) {
      onSelect(roadmap);
    }
  };

  const getCardClassName = () => {
    const baseClasses = "transition-all duration-200 cursor-pointer";
    const selectedClasses = isSelected
      ? "ring-2 ring-blue-500 shadow-lg bg-blue-50 border-blue-200 dark:bg-slate-800 dark:border-slate-600 dark:ring-blue-400"
      : "hover:shadow-md hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500";
    const loadingClasses = disabled || isLoading ? "opacity-50" : "";

    return `${baseClasses} ${selectedClasses} ${loadingClasses}`;
  };

  return (
    <Card className={getCardClassName()} onClick={handleClick}>
      <CardContent className="p-4">
        <RoadmapCardHeader
          roadmap={roadmap}
          isSelected={isSelected}
          isLoading={isLoading}
        />
        <RoadmapCardMeta roadmap={roadmap} />
        {roadmap.description && (
          <RoadmapCardDescription description={roadmap.description} />
        )}
      </CardContent>
    </Card>
  );
};

type RoadmapCardHeaderProps = {
  roadmap: LearningRoadmap;
  isSelected: boolean;
  isLoading: boolean;
};

const RoadmapCardHeader = ({
  roadmap,
  isSelected,
  isLoading,
}: RoadmapCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2 flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 flex-1 text-slate-900 dark:text-slate-100">
          {roadmap.title}
        </h3>
        {isLoading && isSelected && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        )}
        <Link
          href={`/roadmaps/${roadmap.id}`}
          onClick={(e) => e.stopPropagation()}
        >
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
        className={`ml-2 ${getStatusColor(roadmap.status ?? "draft")}`}
      >
        {roadmap.status ?? "draft"}
      </Badge>
    </div>
  );
};

type RoadmapCardMetaProps = {
  roadmap: LearningRoadmap;
};

const RoadmapCardMeta = ({ roadmap }: RoadmapCardMetaProps) => {
  return (
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
  );
};

type RoadmapCardDescriptionProps = {
  description: string;
};

const RoadmapCardDescription = ({
  description,
}: RoadmapCardDescriptionProps) => {
  return (
    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
      {description}
    </p>
  );
};
