"use client";

import { useState, useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { generateCompleteRoadmapAction } from "@/features/roadmaps/actions";
import { useDefaultAIModel } from "@/features/roadmaps/hooks/use-default-ai-model";
import type { RoadmapWithNodes } from "@/features/roadmaps/types";

type UseRoadmapChatProps = {
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
  onRoadmapGenerated?: (roadmap: RoadmapWithNodes) => void;
};

export const useRoadmapChat = ({
  onGenerationStart,
  onGenerationEnd,
  onRoadmapGenerated,
}: UseRoadmapChatProps) => {
  const [message, setMessage] = useState("");
  const { aiModelId, isLoading: isLoadingModel } = useDefaultAIModel();

  const { execute, isExecuting } = useAction(generateCompleteRoadmapAction, {
    onExecute: () => {
      onGenerationStart?.();
    },
    onSuccess: ({ data }) => {
      if (data?.roadmap) {
        onRoadmapGenerated?.(data.roadmap);
      }
      onGenerationEnd?.();
      // Clear message after successful generation
      setTimeout(() => {
        setMessage("");
      }, 100);
    },
    onError: ({ error }) => {
      console.error("Failed to generate roadmap:", error);
      onGenerationEnd?.();
    },
  });

  const extractSkillFromMessage = useCallback((msg: string): string => {
    const patterns = [
      /(?:learn|study|master|understand)\s+(.+?)(?:\s|$)/i,
      /(?:want to|how to)\s+(.+?)(?:\s|$)/i,
      /(.+?)(?:\s+tutorial|\s+course|\s+training)?$/i,
    ];

    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return msg.slice(0, 50);
  }, []);

  const isMessageValid = useCallback((msg: string): boolean => {
    return msg.trim().length >= 10;
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (
      !trimmedMessage ||
      isExecuting ||
      !aiModelId ||
      !isMessageValid(trimmedMessage)
    ) {
      return;
    }

    execute({
      userPrompt: trimmedMessage,
      aiModelId: aiModelId,
    });
  }, [message, isExecuting, aiModelId, execute, isMessageValid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const isDisabled =
    !message.trim() ||
    !isMessageValid(message) ||
    isExecuting ||
    isLoadingModel ||
    !aiModelId;

  const getValidationMessage = useCallback((msg: string) => {
    const length = msg.trim().length;
    if (length < 10) {
      return {
        text: `${10 - length} more characters needed`,
        type: "warning" as const,
      };
    }
    return {
      text: "Ready to generate",
      type: "success" as const,
    };
  }, []);

  return {
    // State
    message,
    isExecuting,
    isLoadingModel,
    aiModelId,

    // Computed
    isDisabled,

    // Actions
    setMessage,
    handleSendMessage,
    handleKeyDown,
    extractSkillFromMessage,
    isMessageValid,
    getValidationMessage,
  };
};
