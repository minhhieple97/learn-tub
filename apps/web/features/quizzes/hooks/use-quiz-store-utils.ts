"use client";

import { useQuizStore } from "../store";

export const useQuizProgress = () => {
  const {
    getCurrentQuestion,
    getCurrentAnswer,
    getHasAnsweredAll,
    getCanGoNext,
    getCanGoPrevious,
    getProgress,
    getAnsweredCount,
    getFormattedTime,
    getFormattedTimeTaken,
  } = useQuizStore();

  return {
    currentQuestion: getCurrentQuestion(),
    currentAnswer: getCurrentAnswer(),
    hasAnsweredAll: getHasAnsweredAll(),
    canGoNext: getCanGoNext(),
    canGoPrevious: getCanGoPrevious(),
    progress: getProgress(),
    answeredCount: getAnsweredCount(),
    formattedTime: getFormattedTime(),
    formattedTimeTaken: getFormattedTimeTaken(),
  };
};

export const useQuizActions = () => {
  const {
    setVideoContext,
    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    updateSettings,
    startTimer,
    stopTimer,
    initializeRetake,
    resetRetake,
  } = useQuizStore();

  return {
    setVideoContext,
    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    resetQuiz,
    updateSettings,
    startTimer,
    stopTimer,
    initializeRetake,
    resetRetake,
  };
};

export const useQuizState = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    sessionId,
    showResults,
    feedback,
    isGenerating,
    isEvaluating,
    settings,
    startTime,
    currentTime,
    timeTakenSeconds,
    isRetakeMode,
    retakeSession,
    videoId,
    videoTitle,
    videoDescription,
    videoTutorial,
  } = useQuizStore();

  return {
    questions,
    answers,
    currentQuestionIndex,
    sessionId,
    showResults,
    feedback,
    isGenerating,
    isEvaluating,
    settings,
    startTime,
    currentTime,
    timeTakenSeconds,
    isRetakeMode,
    retakeSession,
    videoId,
    videoTitle,
    videoDescription,
    videoTutorial,
  };
};
