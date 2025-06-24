import { useEffect, useState } from 'react';
import { useQuizStore } from '../store';
import { useAIModelData } from '@/features/ai/hooks/use-ai-models';

export const useQuizWelcome = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useQuizStore();
  const { data: aiModelData } = useAIModelData();

  useEffect(() => {
    if (aiModelData && !settings.provider && !settings.aiModelId) {
      const { providers, modelOptions } = aiModelData;
      if (providers.length > 0 && modelOptions.length > 0) {
        const firstProvider = providers[0];
        if (firstProvider) {
          const defaultProvider = firstProvider.name;
          const defaultModel = modelOptions.find(
            (option) => option.provider_name === defaultProvider,
          );
          if (defaultModel) {
            updateSettings({
              provider: defaultProvider,
              aiModelId: defaultModel.ai_model_id,
            });
          }
        }
      }
    }
  }, [aiModelData, settings.provider, settings.aiModelId, updateSettings]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return {
    showSettings,
    toggleSettings,
    setShowSettings,
  };
};
