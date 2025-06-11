'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Youtube,
  Play,
  Loader2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { dotPatternUrl } from '@/lib/utils';
import { useAddVideoForm } from '../hooks/use-add-video-form';
import { cn } from '@/lib/utils';

export const AddVideoForm = () => {
  const { url, setUrl, tutorial, setTutorial, isValidUrl, isPending, execute, canSubmit } =
    useAddVideoForm();

  return (
    <TooltipProvider>
      <div className="relative w-full mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 rounded-2xl blur-xl opacity-25 animate-pulse"></div>

        <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 dark:from-red-600 dark:via-red-700 dark:to-red-800">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `url('${dotPatternUrl}')` }}
          ></div>

          <div className="absolute top-4 right-4 text-white/20">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4 text-white/20">
            <Sparkles className="h-4 w-4 animate-pulse delay-1000" />
          </div>

          <CardHeader className="relative text-center pb-8 pt-10">
            <div className="mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-md scale-110"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
                <Youtube className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>

            <CardTitle className="text-4xl font-bold text-white mb-4 tracking-tight">
              Import YouTube Video
            </CardTitle>
            <CardDescription className="text-xl text-red-100 dark:text-red-200 max-w-lg mx-auto leading-relaxed">
              Transform any YouTube video into an interactive learning experience with AI-powered
              quizzes
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-8 pb-10 px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                execute({ videoUrl: url, tutorial: tutorial || undefined });
              }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Label
                  htmlFor="videoUrl"
                  className="text-xl font-semibold text-white flex items-center gap-3"
                >
                  <Youtube className="h-6 w-6" />
                  YouTube URL
                  <span className="text-red-200 dark:text-red-300 text-sm font-normal">
                    (Required)
                  </span>
                </Label>

                <div className="relative group">
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={cn(
                      'h-16 text-lg font-medium transition-all duration-300',
                      'bg-white/95 dark:bg-white/90 backdrop-blur-sm border-0 shadow-lg',
                      'text-gray-900 dark:text-gray-800',
                      'placeholder:text-gray-500 dark:placeholder:text-gray-600',
                      'focus:bg-white dark:focus:bg-white focus:shadow-xl focus:scale-[1.02]',
                      'pl-6 pr-16 rounded-xl',
                      url && isValidUrl && 'ring-2 ring-green-400 bg-green-50',
                      url && !isValidUrl && 'ring-2 ring-orange-400 bg-orange-50',
                    )}
                    required
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {url && isValidUrl && (
                      <CheckCircle className="h-6 w-6 text-green-500 animate-in fade-in duration-300" />
                    )}
                    {url && !isValidUrl && (
                      <AlertCircle className="h-6 w-6 text-orange-500 animate-in fade-in duration-300" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-red-100 dark:text-red-200 text-sm">
                  <div className="h-1 w-1 bg-red-200 dark:bg-red-300 rounded-full"></div>
                  <span>Supports youtube.com, youtu.be, and embedded URLs</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="tutorial"
                    className="text-xl font-semibold text-white flex items-center gap-3"
                  >
                    <BookOpen className="h-6 w-6" />
                    What do you want to learn?
                    <span className="text-red-200 dark:text-red-300 text-sm font-normal">
                      (Optional)
                    </span>
                  </Label>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-64 text-center">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">💡 Why add learning objectives?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          While optional, this helps our AI create more targeted quiz questions for
                          better learning outcomes.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="relative group">
                  <Textarea
                    id="tutorial"
                    name="tutorial"
                    placeholder="e.g., I want to learn Python basics, React hooks, data structures and algorithms..."
                    value={tutorial}
                    onChange={(e) => setTutorial(e.target.value)}
                    className={cn(
                      'min-h-[120px] text-lg font-medium transition-all duration-300',
                      'bg-white/95 dark:bg-white/90 backdrop-blur-sm border-0 shadow-lg resize-none',
                      'text-gray-900 dark:text-gray-800',
                      'placeholder:text-gray-500 dark:placeholder:text-gray-600',
                      'focus:bg-white dark:focus:bg-white focus:shadow-xl focus:scale-[1.02]',
                      'p-6 rounded-xl leading-relaxed',
                    )}
                    maxLength={500}
                  />

                  <div className="absolute bottom-3 right-4 text-xs text-gray-400 dark:text-gray-500">
                    {tutorial.length}/500
                  </div>
                </div>

                <div className="flex items-start gap-3 text-red-100 dark:text-red-200 text-sm bg-white/10 dark:bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-yellow-300 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">✨ AI Enhancement</p>
                    <p>
                      This helps our AI generate better quiz questions tailored to your specific
                      learning goals and interests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  'w-full h-16 text-xl font-bold transition-all duration-300',
                  'bg-white hover:bg-red-50 text-red-600 hover:text-red-700',
                  'shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]',
                  'disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed',
                  'rounded-xl border-2 border-white/20',
                  canSubmit && 'animate-pulse',
                )}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Importing Video...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Play className="h-6 w-6" />
                    <span>Start Learning Journey</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
