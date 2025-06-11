'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { AIProvider } from '@/types';
import { IQuizDifficulty, QuizSettingsType } from '../types';
import { AI_PROVIDERS } from '@/config/constants';

type QuizSettingsProps = {
  settings: QuizSettingsType;
  onUpdateSettings: (settings: Partial<QuizSettingsType>) => void;
};

export const QuizSettings = ({ settings, onUpdateSettings }: QuizSettingsProps) => {
  return (
    <Card className="mb-6 w-full max-w-md border-blue-200 dark:border-blue-800 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Settings className="size-5" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Number of Questions
          </label>
          <Select
            value={settings.questionCount.toString()}
            onValueChange={(value) => onUpdateSettings({ questionCount: parseInt(value) })}
          >
            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Difficulty
          </label>
          <Select
            value={settings.difficulty}
            onValueChange={(value: IQuizDifficulty) => onUpdateSettings({ difficulty: value })}
          >
            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            AI Provider
          </label>
          <Select
            value={settings.provider}
            onValueChange={(value) => onUpdateSettings({ provider: value as AIProvider })}
          >
            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AI_PROVIDERS.OPENAI}>OpenAI</SelectItem>
              <SelectItem value={AI_PROVIDERS.GEMINI}>Google Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
