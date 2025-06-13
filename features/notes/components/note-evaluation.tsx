import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Sparkles, History } from 'lucide-react';
import { AI_CONFIG, STATUS_STREAMING } from '@/config/constants';
import { EvaluationDialogHeader } from './evaluation-dialog-header';
import { EvaluationContent } from './evaluation-content';
import { AIFeedbackHistory } from './note-feedback-history';
import { useNoteEvaluation } from '../hooks/use-note-evaluation';
import { useAIModelData } from '@/features/ai/hooks/use-ai-models';
import type { IAIModelOption } from '@/features/ai/types';

type INoteEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

export const NoteEvaluation = ({ noteId, disabled }: INoteEvaluationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('evaluate');
  const [provider, setProvider] = useState<string | null>(null);
  const [aiModelId, setAIModelId] = useState<string>('');
  const { data } = useAIModelData();
  const providers = data?.providers || [];
  const modelOptions = data?.modelOptions || [];

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
  } = useNoteEvaluation();

  useEffect(() => {
    if (providers.length > 0 && !providers.some((p) => p.name === provider)) {
      setProvider(providers[0].name);
    }
  }, [providers, provider]);

  useEffect(() => {
    if (!aiModelId && modelOptions.length > 0) {
      const providerModel = modelOptions.find(
        (opt: IAIModelOption) => opt.provider_name === provider,
      );
      if (providerModel) {
        setAIModelId(providerModel.ai_model_id);
      }
    }
  }, [provider, aiModelId, modelOptions]);

  const handleEvaluate = async () => {
    if (!aiModelId) return;
    setShowSettings(false);
    await evaluateNote(noteId, aiModelId);
  };

  const handleReset = () => {
    reset();
    setShowSettings(false);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    if (status === STATUS_STREAMING.IDLE) {
      setShowSettings(true);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'evaluate' && status === STATUS_STREAMING.IDLE) {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleAdjustSettings = () => {
    reset();
    setShowSettings(true);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerModel = modelOptions.find(
      (opt: IAIModelOption) => opt.provider_name === newProvider,
    );
    if (providerModel) {
      setAIModelId(providerModel.ai_model_id);
    }
  };

  const handleModelChange = (newModelId: string) => {
    setAIModelId(newModelId);
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
        <EvaluationDialogHeader
          showSettingsButton={isCompleted || hasError}
          onToggleSettings={handleToggleSettings}
        />

        <div className="overflow-y-auto flex-1 py-4 pb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="evaluate" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                New Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="evaluate" className="space-y-6">
              <EvaluationContent
                showSettings={showSettings}
                hasError={hasError}
                error={error || ''}
                isEvaluating={isEvaluating}
                isCompleted={isCompleted}
                streamingContent={streamingContent}
                feedback={feedback}
                status={status}
                provider={provider}
                aiModelId={aiModelId}
                onProviderChange={handleProviderChange}
                onModelChange={handleModelChange}
                onEvaluate={handleEvaluate}
                onReset={handleReset}
                onShowSettings={handleShowSettings}
                onAdjustSettings={handleAdjustSettings}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6 pb-4">
              <AIFeedbackHistory noteId={noteId} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
