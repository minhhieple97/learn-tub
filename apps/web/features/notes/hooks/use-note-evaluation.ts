import { useEffect, useMemo } from "react";
import { useNotesStore } from "../store";
import { useAIModelData } from "@/features/ai/hooks/use-ai-models";
import type { IAIModelOption } from "@/features/ai/types";

type UseNoteEvaluationProps = {
  noteId: string;
  disabled?: boolean;
};

type UseNoteEvaluationReturn = {
  isLoading: boolean;
  evaluation: {
    isOpen: boolean;
    activeTab: string;
    provider: string | null;
    aiModelId: string;
    isCompleted: boolean;
    hasError: boolean;
  };
  handleOpenDialog: () => void;
  handleCloseDialog: (open: boolean) => void;
  handleTabChange: (value: string) => void;
  toggleSettings: () => void;
};

export const useNoteEvaluation = ({
  noteId,
  disabled,
}: UseNoteEvaluationProps): UseNoteEvaluationReturn => {
  const { data, isLoading } = useAIModelData();
  const providers = useMemo(() => data?.providers || [], [data?.providers]);
  const modelOptions = useMemo(
    () => data?.modelOptions || [],
    [data?.modelOptions],
  );

  const {
    evaluation,
    openEvaluation,
    closeEvaluationWithReset,
    setActiveTab,
    setProvider,
    setAiModelId,
    toggleSettings,
  } = useNotesStore();

  useEffect(() => {
    if (
      providers.length > 0 &&
      !providers.some((p) => p.name === evaluation.provider)
    ) {
      setProvider(providers[0]?.name || "");
    }
  }, [providers, evaluation.provider, setProvider]);

  useEffect(() => {
    if (
      evaluation.provider &&
      modelOptions.length > 0 &&
      !evaluation.aiModelId
    ) {
      const providerModel = modelOptions.find(
        (opt: IAIModelOption) => opt.provider_name === evaluation.provider,
      );
      if (providerModel) {
        setAiModelId(providerModel.ai_model_id);
      }
    }
  }, [evaluation.provider, evaluation.aiModelId, modelOptions, setAiModelId]);

  const handleOpenDialog = () => {
    if (disabled || isLoading) return;
    openEvaluation(noteId);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      closeEvaluationWithReset();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    isLoading,
    evaluation: {
      isOpen: evaluation.isOpen,
      activeTab: evaluation.activeTab,
      provider: evaluation.provider,
      aiModelId: evaluation.aiModelId,
      isCompleted: evaluation.isCompleted,
      hasError: evaluation.hasError,
    },
    handleOpenDialog,
    handleCloseDialog,
    handleTabChange,
    toggleSettings,
  };
};
