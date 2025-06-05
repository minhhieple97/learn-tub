import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { AI_CONFIG, AI_PROVIDERS } from '@/config/constants';
import { AIFeedbackDisplay } from './ai-feedback-display';
import { AIEvaluationStreaming } from './ai-evaluation-streaming';
import { AIModelSelector } from './ai-model-selector';
import { useAIEvaluation } from '../hooks';
import type { AIProvider } from '../types';

type NoteAIEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

export const NoteAIEvaluation = ({ noteId, disabled }: NoteAIEvaluationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIProvider>(AI_PROVIDERS.OPENAI);
  const [model, setModel] = useState<string>(AI_CONFIG.DEFAULT_MODEL);

  const {
    status,
    feedback,
    streamingContent,
    error,
    evaluateNote,
    reset,
    isEvaluating,
    isCompleted,
    hasError,
  } = useAIEvaluation();

  const handleEvaluate = async () => {
    setShowSettings(false);
    await evaluateNote(noteId, provider, model);
  };

  const handleReset = () => {
    reset();
    setShowSettings(false);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    if (status === 'idle') {
      setShowSettings(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleOpenDialog}
          className="h-8 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
        >
          <Brain className="h-4 w-4 mr-1" />
          Analyze
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl overflow-hidden"
        style={{
          maxHeight: '90vh',
        }}
      >
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span>AI Note Evaluation</span>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
            {(isCompleted || hasError) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-6 py-4">
          {showSettings && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AIModelSelector
                  provider={provider}
                  model={model}
                  onProviderChange={setProvider}
                  onModelChange={setModel}
                  disabled={isEvaluating}
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isEvaluating ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                  {(isCompleted || hasError) && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isEvaluating}
                      className="hover:bg-gray-50"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {hasError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">Analysis Failed</h4>
                    <p className="text-sm text-red-700 mb-3">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Adjust Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(isEvaluating || streamingContent) && (
            <AIEvaluationStreaming content={streamingContent} isEvaluating={isEvaluating} />
          )}

          {feedback && isCompleted && (
            <AIFeedbackDisplay feedback={feedback} onReset={handleReset} />
          )}

          {status === 'idle' && !showSettings && (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Get AI-Powered Insights
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Analyze your learning notes with advanced AI to receive personalized feedback
                      on accuracy, clarity, and suggestions for improvement.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Content Analysis
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      Accuracy Check
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      Improvement Tips
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setShowSettings(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Start Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
