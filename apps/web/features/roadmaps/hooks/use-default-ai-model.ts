"use client";

import { useState, useEffect } from "react";

export const useDefaultAIModel = () => {
  const [aiModelId, setAiModelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDefaultAIModel = async () => {
      try {
        const response = await fetch("/api/ai-models/default");
        const data = await response.json();

        if (data?.modelId) {
          setAiModelId(data.modelId);
        } else {
          // Fallback to a default UUID if no model found
          setAiModelId("550e8400-e29b-41d4-a716-446655440000");
        }
      } catch (error) {
        console.error("Failed to fetch default AI model:", error);
        // Fallback to a default UUID
        setAiModelId("550e8400-e29b-41d4-a716-446655440000");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultAIModel();
  }, []);

  return { aiModelId, isLoading };
};
