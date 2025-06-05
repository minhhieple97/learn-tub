import { useState, useCallback } from 'react';
import {
  AI_PROVIDERS,
  AI_CONFIG,
  AI_API,
  AI_STATUS,
  AI_CHUNK_TYPES,
  AI_ERROR_MESSAGES,
} from '@/config/constants';
import type { AIFeedback, AIProvider, AIEvaluationStatus } from '../types';

export const useAIEvaluation = () => {
  const [status, setStatus] = useState<AIEvaluationStatus>(AI_STATUS.IDLE);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const evaluateNote = useCallback(
    async (
      noteId: string,
      provider: AIProvider = AI_PROVIDERS.OPENAI,
      model: string = AI_CONFIG.DEFAULT_MODEL,
    ) => {
      try {
        setStatus(AI_STATUS.EVALUATING);
        setError(null);
        setFeedback(null);
        setStreamingContent('');

        const streamUrl = `${AI_API.EVALUATE_NOTE_PATH}?noteId=${noteId}&provider=${provider}&model=${model}`;

        const response = await fetch(streamUrl);

        if (!response.ok) {
          throw new Error(`${AI_ERROR_MESSAGES.FAILED_TO_EVALUATE_NOTE}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error(AI_ERROR_MESSAGES.NO_RESPONSE_BODY);
        }

        setStatus(AI_STATUS.STREAMING);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith(AI_API.SSE_DATA_PREFIX)) {
              try {
                const chunk = JSON.parse(line.slice(AI_API.SSE_DATA_PREFIX_LENGTH));

                if (chunk.type === AI_CHUNK_TYPES.FEEDBACK) {
                  setStreamingContent((prev) => prev + chunk.content);
                } else if (chunk.type === AI_CHUNK_TYPES.COMPLETE) {
                  const completeFeedback: AIFeedback = JSON.parse(chunk.content);
                  setFeedback(completeFeedback);
                  setStatus(AI_STATUS.COMPLETED);
                  setStreamingContent('');
                } else if (chunk.type === AI_CHUNK_TYPES.ERROR) {
                  setError(chunk.content);
                  setStatus(AI_STATUS.ERROR);
                  setStreamingContent('');
                }
              } catch (parseError) {
                console.error(AI_ERROR_MESSAGES.FAILED_TO_PARSE_CHUNK, parseError);
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : AI_ERROR_MESSAGES.UNKNOWN_ERROR);
        setStatus(AI_STATUS.ERROR);
        setStreamingContent('');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus(AI_STATUS.IDLE);
    setFeedback(null);
    setStreamingContent('');
    setError(null);
  }, []);

  return {
    status,
    feedback,
    streamingContent,
    error,
    evaluateNote,
    reset,
    isEvaluating: status === AI_STATUS.EVALUATING || status === AI_STATUS.STREAMING,
    isCompleted: status === AI_STATUS.COMPLETED,
    hasError: status === AI_STATUS.ERROR,
  };
};
