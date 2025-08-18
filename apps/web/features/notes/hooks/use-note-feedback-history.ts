import { useState, useCallback } from "react";
import { toast } from "sonner";
import { INoteEvaluationResult } from "@/features/quizzes/types";

export const useNoteFeedbackHistory = () => {
  const [history, setHistory] = useState<INoteEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (noteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}/ai-feedback`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setHistory(result.data);
      } else {
        const errorMessage = result.error || "Failed to fetch feedback history";
        setError(errorMessage);
        toast.error("Failed to load feedback history");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load feedback history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/notes/ai-feedback/${feedbackId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setHistory((prev) => prev.filter((item) => item.id !== feedbackId));
          toast.success("Feedback deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete feedback");
        }
      } else {
        toast.error("Failed to delete feedback");
      }
    } catch {
      toast.error("Failed to delete feedback");
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
