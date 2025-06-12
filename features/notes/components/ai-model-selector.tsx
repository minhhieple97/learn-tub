import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AI_MODELS, AI_PROVIDERS } from '@/config/constants';
import { AIProvider } from '@/types';

type IAIModelSelectorProps = {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
};

export const AIModelSelector = ({
  provider,
  model,
  onProviderChange,
  onModelChange,
  disabled,
}: IAIModelSelectorProps) => {
  const handleProviderChange = (newProvider: AIProvider) => {
    onProviderChange(newProvider);
    const firstModel = AI_MODELS[newProvider][0]?.value;
    if (firstModel) {
      onModelChange(firstModel);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ai-provider">AI Provider</Label>
        <Select value={provider} onValueChange={handleProviderChange} disabled={disabled}>
          <SelectTrigger id="ai-provider">
            <SelectValue placeholder="Select AI provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AI_PROVIDERS.GEMINI}>Google Gemini</SelectItem>
            <SelectItem value={AI_PROVIDERS.OPENAI}>OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-model">Model</Label>
        <Select value={model} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger id="ai-model">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS[provider].map((modelOption) => (
              <SelectItem key={modelOption.value} value={modelOption.value}>
                {modelOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
