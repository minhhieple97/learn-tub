import { useState, useCallback } from 'react';
import {
  AI_PROVIDERS,
  AI_CONFIG,
  AI_API,
  CHUNK_TYPES,
  ERROR_MESSAGES,
  STATUS_STREAMING,
} from '@/config/constants';
import { AIProvider, IFeedback } from '@/types';
import { INoteEvaluationStatus } from '../types';

export const useNoteEvaluation = () => {
  const [status, setStatus] = useState<INoteEvaluationStatus>(STATUS_STREAMING.IDLE);
  const [feedback, setFeedback] = useState<IFeedback | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const evaluateNote = useCallback(
    async (
      noteId: string,
      provider: AIProvider = AI_PROVIDERS.OPENAI,
      model: string = AI_CONFIG.DEFAULT_MODEL,
    ) => {
      try {
        setStatus(STATUS_STREAMING.EVALUATING);
        setError(null);
        setFeedback(null);
        setStreamingContent('');

        const streamUrl = `${AI_API.EVALUATE_NOTE_PATH}?noteId=${noteId}&provider=${provider}&model=${model}`;

        const response = await fetch(streamUrl);

        if (!response.ok) {
          throw new Error(`${ERROR_MESSAGES.FAILED_TO_EVALUATE_NOTE}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error(ERROR_MESSAGES.NO_RESPONSE_BODY);
        }

        setStatus(STATUS_STREAMING.STREAMING);

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

                if (chunk.type === CHUNK_TYPES.FEEDBACK) {
                  setStreamingContent((prev) => prev + chunk.content);
                } else if (chunk.type === CHUNK_TYPES.COMPLETE) {
                  const completeFeedback: IFeedback = JSON.parse(chunk.content);
                  setFeedback(completeFeedback);
                  setStatus(STATUS_STREAMING.COMPLETED);
                  setStreamingContent('');
                } else if (chunk.type === CHUNK_TYPES.ERROR) {
                  setError(chunk.content);
                  setStatus(STATUS_STREAMING.ERROR);
                  setStreamingContent('');
                }
              } catch (parseError) {
                console.error(ERROR_MESSAGES.FAILED_TO_PARSE_CHUNK, parseError);
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR);
        setStatus(STATUS_STREAMING.ERROR);
        setStreamingContent('');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus(STATUS_STREAMING.IDLE);
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
    isEvaluating: status === STATUS_STREAMING.EVALUATING || status === STATUS_STREAMING.STREAMING,
    isCompleted: status === STATUS_STREAMING.COMPLETED,
    hasError: status === STATUS_STREAMING.ERROR,
  };
};
