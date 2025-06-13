import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Calendar,
  Settings,
  Trash2,
  Eye,
  Clock,
  Brain,
  Sparkles,
} from 'lucide-react';
import { NoteFeedbackDisplay } from './note-feedback-display';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useNoteFeedbackHistory } from '../hooks/use-note-feedback-history';
import { INoteEvaluationResult } from '@/features/quizzes/types';
import { IFeedback } from '@/types';

type AIFeedbackHistoryProps = {
  noteId: string;
};

export const AIFeedbackHistory = ({ noteId }: AIFeedbackHistoryProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(null);
  const { history, isLoading, error, fetchHistory, hasHistory } = useNoteFeedbackHistory();

  useEffect(() => {
    if (noteId) {
      fetchHistory(noteId);
    }
  }, [noteId, fetchHistory]);

  const handleViewFeedback = (result: INoteEvaluationResult) => {
    setSelectedFeedback(result.feedback as IFeedback);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProviderIcon = (provider: string | null) => {
    if (!provider) return <Settings className="h-4 w-4" />;

    switch (provider) {
      case 'openai':
        return <Brain className="h-4 w-4" />;
      case 'gemini':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (selectedFeedback) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground">Feedback Details</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFeedback(null)}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            ← Back to History
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <NoteFeedbackDisplay
            feedback={selectedFeedback}
            onReset={() => setSelectedFeedback(null)}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground">AI Feedback History</h3>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground">AI Feedback History</h3>
          <Badge
            variant="outline"
            className="text-xs font-medium px-2 py-1 border-red-200 text-red-700"
          >
            Error
          </Badge>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 w-full max-w-md mx-auto">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-red-900 dark:text-red-100">
                    Failed to Load History
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchHistory(noteId)}
                  className="border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 mt-2"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasHistory) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground">AI Feedback History</h3>
          <Badge variant="outline" className="text-xs font-medium px-2 py-1">
            0 evaluations
          </Badge>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="border-dashed border-2 border-border w-full max-w-md mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-gradient-to-br from-muted to-muted/80 rounded-2xl flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your AI feedback history will appear here after you run evaluations. Start
                    analyzing your notes to see insights and track your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-semibold text-foreground">AI Feedback History</h3>
        <Badge variant="outline" className="text-xs font-medium px-2 py-1">
          {history.length} {history.length === 1 ? 'evaluation' : 'evaluations'}
        </Badge>
      </div>

      <div
        className="flex-1 space-y-4 overflow-y-auto pr-2 pb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
        style={{
          maxHeight: '60vh',
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))',
        }}
      >
        {history.map((result, index) => {
          const feedback = result.feedback as IFeedback;
          const createdAt = new Date(result.created_at);

          return (
            <Card
              key={result.id}
              className="group hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 bg-card border border-border"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Provider Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {getProviderIcon(result.provider)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize text-foreground">
                          {result.provider}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground"
                        >
                          {result.model}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-9">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Right Side - Score & Actions */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${getScoreColor(
                        feedback.overall_score,
                      )} text-white text-sm font-semibold px-3 py-1 border-0`}
                    >
                      {feedback.overall_score}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewFeedback(result)}
                      className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-5">
                {/* Summary */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {feedback.summary}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {feedback.correct_points.length} correct
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {feedback.incorrect_points.length} to review
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {feedback.improvement_suggestions.length} tips
                      </span>
                    </div>
                  </div>

                  {/* Card number indicator */}
                  <div className="text-xs text-muted-foreground/70 font-medium">#{index + 1}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
