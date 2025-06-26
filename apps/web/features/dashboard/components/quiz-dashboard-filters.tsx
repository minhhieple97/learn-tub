"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { QUIZZ_FILTER_VALUES } from "@/config/constants";
import { useQuizDashboardFilters } from "../hooks/use-quiz-dashboard-filters";

type Video = {
  id: string;
  title: string;
  youtube_id: string;
};

type IQuizDashboardFiltersProps = {
  videos: Video[];
};

export const QuizDashboardFilters = ({
  videos,
}: IQuizDashboardFiltersProps) => {
  const {
    search,
    difficulty,
    videoId,
    sortBy,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  } = useQuizDashboardFilters();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search quizzes..."
              value={search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Select
            value={difficulty}
            onValueChange={(value) => handleFilterChange("difficulty", value)}
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value={QUIZZ_FILTER_VALUES.DIFFICULTIES.ALL}>
                All Difficulties
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.DIFFICULTIES.EASY}>
                Easy
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.DIFFICULTIES.MEDIUM}>
                Medium
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.DIFFICULTIES.HARD}>
                Hard
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.DIFFICULTIES.MIXED}>
                Mixed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={videoId || QUIZZ_FILTER_VALUES.ALL}
            onValueChange={(value) =>
              handleFilterChange(
                "videoId",
                value === QUIZZ_FILTER_VALUES.ALL ? "" : value,
              )
            }
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Select Video" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value={QUIZZ_FILTER_VALUES.ALL}>
                All Videos
              </SelectItem>
              {videos.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value={QUIZZ_FILTER_VALUES.SORT_OPTIONS.CREATED_AT}>
                Date Created
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.SORT_OPTIONS.SCORE}>
                Best Score
              </SelectItem>
              <SelectItem value={QUIZZ_FILTER_VALUES.SORT_OPTIONS.ATTEMPTS}>
                Attempts
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
