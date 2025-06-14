'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useQuizDashboardFilters } from '../hooks/use-quiz-dashboard-filters';
import { cn } from '@/lib/utils';

type Video = {
  id: string;
  title: string;
  youtube_id: string;
};

type QuizDashboardFiltersProps = {
  videos: Video[];
};

export const QuizDashboardFilters = ({ videos }: QuizDashboardFiltersProps) => {
  const {
    search,
    difficulty,
    videoId,
    sortBy,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    isPending,
  } = useQuizDashboardFilters();

  return (
    <Card
      className={cn(
        'border-border bg-card transition-opacity',
        isPending && 'opacity-50',
      )}
    >
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
              disabled={isPending}
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
              onChange={(e) => handleFilterChange('search', e.target.value)}
              disabled={isPending}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <Select
            value={difficulty}
            onValueChange={(value) => handleFilterChange('difficulty', value)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={videoId || 'all'}
            onValueChange={(value) =>
              handleFilterChange('videoId', value === 'all' ? '' : value)
            }
            disabled={isPending}
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Select Video" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Videos</SelectItem>
              {videos.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => handleFilterChange('sortBy', value)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-background border-input text-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="score">Best Score</SelectItem>
              <SelectItem value="attempts">Attempts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
