"use client";

import { Button } from "@/components/ui/button";
import { Brain, Play, Settings, Loader2 } from "lucide-react";
import { QuizzSettings } from "./quizz-settings";
import { useQuizWelcome } from "../hooks/use-quiz-welcome";
import { useQuizStore } from "../store";

export const QuizzWelcomeScreen = () => {
  const { showSettings, toggleSettings, isLoadingAIModel } = useQuizWelcome();
  const { isGenerating, generateQuestions } = useQuizStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 shadow-lg">
        <Brain className="size-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="mb-4 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        AI Quiz Assistant
      </h2>
      <p className="mb-8 max-w-md text-slate-600 dark:text-slate-300 leading-relaxed">
        Test your knowledge with AI-generated questions based on this video
        content. Get personalized feedback to improve your understanding.
      </p>

      {showSettings && <QuizzSettings />}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={toggleSettings}
          disabled={isGenerating || isLoadingAIModel}
          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/50"
        >
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
        <Button
          onClick={generateQuestions}
          disabled={isGenerating || isLoadingAIModel}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : isLoadingAIModel ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Play className="mr-2 size-4" />
          )}
          {isLoadingAIModel ? "Loading AI Model Data" : "Generate Quiz"}
        </Button>
      </div>
    </div>
  );
};
