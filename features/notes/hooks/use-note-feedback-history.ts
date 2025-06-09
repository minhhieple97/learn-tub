import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getAIFeedbackHistoryAction,
  deleteAIFeedbackAction,
} from '../../quizzes/actions/get-ai-feedback-history';
import { AIEvaluationResult } from '@/features/quizzes/types';

export const useNoteFeedbackHistory = () => {
  const [history, setHistory] = useState<AIEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (noteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAIFeedbackHistoryAction({ noteId });

      if (result.data?.success && result.data.data) {
        setHistory(result.data.data);
      } else {
        const errorMessage =
          result.data?.error || 'Failed to fetch feedback history';
        setError(errorMessage);
        toast.error('Failed to load feedback history');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to load feedback history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    try {
      const result = await deleteAIFeedbackAction({ feedbackId });

      if (result.data?.success) {
        setHistory((prev) => prev.filter((item) => item.id !== feedbackId));
        toast.success('Feedback deleted successfully');
      } else {
        toast.error(result.serverError || 'Failed to delete feedback');
      }
    } catch (_err) {
      toast.error('Failed to delete feedback');
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setError(null);
  }, []);

  const refreshHistory = useCallback(
    async (noteId: string) => {
      await fetchHistory(noteId);
    },
    [fetchHistory],
  );

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    deleteFeedback,
    clearHistory,
    refreshHistory,
    hasHistory: history.length > 0,
  };
};
