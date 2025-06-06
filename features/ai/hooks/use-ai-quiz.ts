import { useState, useCallback } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { generateQuizQuestionsAction, evaluateQuizAction } from '../actions';
import type { QuizSettings, QuizState } from '../types';
import { AI_DEFAULTS, AI_PROVIDERS, AI_QUIZ_CONFIG } from '@/config/constants';

export const useAIQuiz = (videoId: string) => {
  const [state, setState] = useState<QuizState>({
    questions: [],
    answers: [],
    currentQuestionIndex: 0,
    showResults: false,
    feedback: null,
    isGenerating: false,
    isEvaluating: false,
    settings: {
      questionCount: AI_QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
      difficulty: AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY,
      provider: AI_PROVIDERS.OPENAI,
      model: AI_DEFAULTS.SERVICE_MODEL,
    },
  });

  const { execute: executeGenerate, isExecuting: isGeneratingQuestions } =
    useAction(generateQuizQuestionsAction, {
      onSuccess: (result) => {
        setState((prev) => ({
          ...prev,
          questions: result.data?.questions || [],
          answers: [],
          currentQuestionIndex: 0,
          showResults: false,
          feedback: null,
          isGenerating: false,
        }));
      },
      onError: (error) => {
        console.error('Failed to generate questions:', error);
        setState((prev) => ({ ...prev, isGenerating: false }));
      },
    });

  const { execute: executeEvaluate, isExecuting: isEvaluatingQuiz } = useAction(
    evaluateQuizAction,
    {
      onSuccess: (result) => {
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

  const generateQuestions = useCallback(
    async (
      videoTitle?: string,
      videoDescription?: string,
      customSettings?: Partial<QuizSettings>,
    ) => {
      const settings = { ...state.settings, ...customSettings };
      setState((prev) => ({ ...prev, isGenerating: true, settings }));

      executeGenerate({
        videoId,
        videoTitle,
        videoDescription,
        questionCount: settings.questionCount,
        difficulty: settings.difficulty,
        provider: settings.provider,
        model: settings.model,
      });
    },
    [videoId, state.settings, executeGenerate],
  );

  const answerQuestion = useCallback(
    (questionId: string, selectedAnswer: 'A' | 'B' | 'C' | 'D') => {
      setState((prev) => {
        const existingAnswerIndex = prev.answers.findIndex(
          (a) => a.questionId === questionId,
        );
        const newAnswers = [...prev.answers];

        if (existingAnswerIndex >= 0) {
          newAnswers[existingAnswerIndex] = { questionId, selectedAnswer };
        } else {
          newAnswers.push({ questionId, selectedAnswer });
        }

        return {
          ...prev,
          answers: newAnswers,
        };
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

      executeEvaluate({
        videoId,
        questions: state.questions,
        answers: state.answers,
        videoContext: {
          title: videoTitle,
          description: videoDescription,
        },
        provider: state.settings.provider,
        model: state.settings.model,
      });
    },
    [videoId, state.questions, state.answers, state.settings, executeEvaluate],
  );

  const resetQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      showResults: false,
      feedback: null,
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<QuizSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

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

  return {
    questions: state.questions,
    answers: state.answers,
    currentQuestionIndex: state.currentQuestionIndex,
    showResults: state.showResults,
    feedback: state.feedback,
    settings: state.settings,

    currentQuestion,
    currentAnswer,

    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,

    isGenerating: isGeneratingQuestions || state.isGenerating,
    isEvaluating: isEvaluatingQuiz || state.isEvaluating,

    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    updateSettings,
  };
};
