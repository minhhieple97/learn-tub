"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { useRoadmapChat } from "@/features/roadmaps/hooks/use-roadmap-chat";
import type { RoadmapWithNodes } from "../types";

type RoadmapChatboxProps = {
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
  onRoadmapGenerated?: (roadmap: RoadmapWithNodes) => void;
};

const EXAMPLE_MESSAGES = [
  "I want to learn React development",
  "Help me master machine learning",
  "Teach me web design basics",
];

export const RoadmapChatbox = ({
  onGenerationStart,
  onGenerationEnd,
  onRoadmapGenerated,
}: RoadmapChatboxProps) => {
  const {
    message,
    setMessage,
    isExecuting,
    isLoadingModel,
    isDisabled,
    handleSendMessage,
    handleKeyDown,
    getValidationMessage,
  } = useRoadmapChat({
    onGenerationStart,
    onGenerationEnd,
    onRoadmapGenerated,
  });

  const validationInfo = getValidationMessage(message);

  const getButtonContent = () => {
    if (isLoadingModel) {
      return (
        <>
          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
          Loading AI Model...
        </>
      );
    }

    if (isExecuting) {
      return (
        <>
          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
          Generating Roadmap...
        </>
      );
    }

    return (
      <>
        <Send className="h-4 w-4 mr-2" />
        Generate Roadmap
      </>
    );
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
            <span
              className={
                validationInfo.type === "warning"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
              }
            >
              {validationInfo.text}
            </span>
            <span>{message.trim().length}/2000</span>
          </div>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={isDisabled}
          className="w-full"
        >
          {getButtonContent()}
        </Button>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p>💡 Try messages like:</p>
          <ul className="mt-1 space-y-1">
            {EXAMPLE_MESSAGES.map((example, index) => (
              <li key={index}>• "{example}"</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
