'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { evaluateQuizAction } from '../actions';
import type { QuizSettings, QuizState, QuizSession } from '../types';
import { AI_DEFAULTS, AI_PROVIDERS, AI_QUIZ_CONFIG } from '@/config/constants';

type ExtendedQuizState = QuizState & {
  startTime: number | null;
  currentTime: number;
  timeTakenSeconds: number;
  sessionId: string | null;
  isRetakeMode: boolean;
};

export const useAIQuizRetake = (
  videoId: string,
  existingSession?: QuizSession,
  hasStarted?: boolean,
) => {
  const [state, setState] = useState<ExtendedQuizState>(() => {
    if (existingSession) {
      return {
        questions: existingSession.questions as any[],
        answers: [],
        currentQuestionIndex: 0,
        showResults: false,
        feedback: null,
        isGenerating: false,
        isEvaluating: false,
        startTime: null,
        currentTime: 0,
        timeTakenSeconds: 0,
        sessionId: existingSession.id,
        isRetakeMode: true,
        settings: {
          questionCount: existingSession.question_count,
          difficulty: existingSession.difficulty as any,
          provider: existingSession.ai_provider as any,
          model: existingSession.ai_model,
        },
      };
    }
    return {
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      showResults: false,
      feedback: null,
      isGenerating: false,
      isEvaluating: false,
      startTime: null,
      currentTime: 0,
      timeTakenSeconds: 0,
      sessionId: null,
      isRetakeMode: false,
      settings: {
        questionCount: AI_QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
        difficulty: AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY,
        provider: AI_PROVIDERS.OPENAI,
        model: AI_DEFAULTS.SERVICE_MODEL,
      },
    };
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = useCallback(() => {
    const startTime = Date.now();
    setState((prev) => ({ ...prev, startTime, currentTime: 0 }));
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.startTime) {
          const currentTime = Math.floor((Date.now() - prev.startTime) / 1000);
          return { ...prev, currentTime };
        }
        return prev;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState((prev) => {
      if (prev.startTime) {
        const timeTakenSeconds = Math.floor(
          (Date.now() - prev.startTime) / 1000,
        );
        return { ...prev, timeTakenSeconds };
      }
      return prev;
    });
  }, []);

  const { execute: executeEvaluate, isExecuting: isEvaluatingQuiz } = useAction(
    evaluateQuizAction,
    {
      onSuccess: (result) => {
        stopTimer();
        setState((prev) => ({
          ...prev,
          feedback: result.data?.feedback || null,
          showResults: true,
          isEvaluating: false,
        }));
      },
      onError: (error) => {
        console.error('Failed to evaluate quiz:', error);
        setState((prev) => ({ ...prev, isEvaluating: false }));
      },
    },
  );

  const answerQuestion = useCallback(
    (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
      setState((prev) => {
        const existingAnswerIndex = prev.answers.findIndex(
          (a) => a.questionId === questionId,
        );

        const newAnswers = [...prev.answers];
        if (existingAnswerIndex >= 0) {
          newAnswers[existingAnswerIndex] = {
            questionId,
            selectedAnswer: answer,
          };
        } else {
          newAnswers.push({ questionId, selectedAnswer: answer });
        }

        return { ...prev, answers: newAnswers };
      });
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        prev.questions.length - 1,
      ),
    }));
  }, []);

  const previousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(
        0,
        Math.min(index, prev.questions.length - 1),
      ),
    }));
  }, []);

  const submitQuiz = useCallback(
    async (videoTitle?: string, videoDescription?: string) => {
      if (state.questions.length === 0 || state.answers.length === 0) {
        return;
      }

      setState((prev) => ({ ...prev, isEvaluating: true }));

      const finalTimeTaken = state.startTime
        ? Math.floor((Date.now() - state.startTime) / 1000)
        : state.timeTakenSeconds;

      executeEvaluate({
        videoId: videoId,
        questions: state.questions,
        answers: state.answers,
        videoContext: {
          title: videoTitle,
          description: videoDescription,
        },
        provider: state.settings.provider,
        model: state.settings.model,
        quizSessionId: state.sessionId || '',
        timeTakenSeconds: finalTimeTaken,
      });
    },
    [
      videoId,
      state.questions,
      state.answers,
      state.settings,
      state.startTime,
      state.timeTakenSeconds,
      state.sessionId,
      executeEvaluate,
    ],
  );

  const resetQuiz = useCallback(() => {
    stopTimer();
    setState((prev) => ({
      ...prev,
      answers: [],
      currentQuestionIndex: 0,
      showResults: false,
      feedback: null,
      startTime: null,
      currentTime: 0,
      timeTakenSeconds: 0,
    }));
  }, [stopTimer]);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentAnswer = state.answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );
  const hasAnsweredAll = state.answers.length === state.questions.length;
  const canGoNext = state.currentQuestionIndex < state.questions.length - 1;
  const canGoPrevious = state.currentQuestionIndex > 0;
  const progress =
    state.questions.length > 0
      ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100
      : 0;
  const answeredCount = state.answers.length;

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  return {
    questions: state.questions,
    answers: state.answers,
    currentQuestionIndex: state.currentQuestionIndex,
    showResults: state.showResults,
    feedback: state.feedback,
    settings: state.settings,
    currentTime: state.currentTime,
    timeTakenSeconds: state.timeTakenSeconds,
    formattedTime: formatTime(state.currentTime),
    isRetakeMode: state.isRetakeMode,

    currentQuestion,
    currentAnswer,

    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,

    isGenerating: false,
    isEvaluating: isEvaluatingQuiz || state.isEvaluating,

    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    formatTime,
    startTimer,
  };
};
