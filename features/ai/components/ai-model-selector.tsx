import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIModelData } from '@/features/ai/hooks/use-ai-models';
import type { IAIModelOption } from '@/features/ai/types';

type IAIModelSelectorProps = {
  provider: string | null;
  aiModelId: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
};

export const AIModelSelector = ({
  provider,
  aiModelId,
  onProviderChange,
  onModelChange,
  disabled,
}: IAIModelSelectorProps) => {
  const { data, isLoading } = useAIModelData();
  const providers = data?.providers || [];
  const allModelOptions = data?.modelOptions || [];
  const filteredModelOptions = provider
    ? allModelOptions.filter((option: IAIModelOption) => option.provider_name === provider)
    : allModelOptions;

  useEffect(() => {
    if (!aiModelId && filteredModelOptions.length > 0) {
      onModelChange(filteredModelOptions[0].ai_model_id);
    }
  }, [provider, aiModelId, filteredModelOptions, onModelChange]);

  const handleProviderChange = (newProvider: string) => {
    onProviderChange(newProvider);
    const newProviderModels = allModelOptions.filter(
      (option: IAIModelOption) => option.provider_name === newProvider,
    );
    if (newProviderModels.length > 0) {
      onModelChange(newProviderModels[0].ai_model_id);
    } else {
      onModelChange('');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ai-provider">AI Provider</Label>
        <Select value={provider || ''} onValueChange={handleProviderChange} disabled={disabled}>
          <SelectTrigger id="ai-provider">
            <SelectValue placeholder="Select AI provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.name} value={provider.name}>
                {provider.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-model">Model</Label>
        <Select value={aiModelId} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger id="ai-model">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {filteredModelOptions.map((option: IAIModelOption) => (
              <SelectItem key={option.ai_model_id} value={option.ai_model_id}>
                {provider ? option.label : `${option.provider_display_name} - ${option.label}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
