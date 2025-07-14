"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { generateCompleteRoadmapAction } from "../actions";
import { useDefaultAIModel } from "../hooks/use-default-ai-model";
import type { RoadmapWithNodes } from "../types";

type RoadmapChatboxProps = {
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
  onRoadmapGenerated?: (roadmap: RoadmapWithNodes) => void;
};

export const RoadmapChatbox = ({
  onGenerationStart,
  onGenerationEnd,
  onRoadmapGenerated,
}: RoadmapChatboxProps) => {
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
      // Delay clearing the message to prevent browser extension range errors
      setTimeout(() => {
        setMessage("");
      }, 100);
    },
    onError: ({ error }) => {
      console.error("Failed to generate roadmap:", error);
      onGenerationEnd?.();
    },
  });

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isExecuting || !aiModelId) return;

    execute({
      userPrompt: trimmedMessage,
      aiModelId: aiModelId,
    });
  };

  const extractSkillFromMessage = (msg: string): string => {
    // Simple extraction logic - look for common patterns
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

    return msg.slice(0, 50); // Fallback to first 50 chars
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Create Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Tell me what you want to learn... (e.g., 'I want to learn React development' or 'Help me master machine learning')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>
              {message.trim().length < 10 ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {10 - message.trim().length} more characters needed
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  Ready to generate
                </span>
              )}
            </span>
            <span>{message.trim().length}/2000</span>
          </div>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={
            !message.trim() ||
            message.trim().length < 10 ||
            isExecuting ||
            isLoadingModel ||
            !aiModelId
          }
          className="w-full"
        >
          {isLoadingModel ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Loading AI Model...
            </>
          ) : isExecuting ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Generate Roadmap
            </>
          )}
        </Button>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p>💡 Try messages like:</p>
          <ul className="mt-1 space-y-1">
            <li>• "I want to learn React development"</li>
            <li>• "Help me master machine learning"</li>
            <li>• "Teach me web design basics"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
