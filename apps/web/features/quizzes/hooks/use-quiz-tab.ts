import { useEffect } from "react";
import { useQuizStore } from "../store";
import { IQuizAnswerOption } from "../types";
import { useNotesStore } from "@/features/notes/store";

export const useQuizTab = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    showResults,
    feedback,
    isGenerating,
    isEvaluating,
    setVideoContext,
    generateQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    getCurrentQuestion,
    getCurrentAnswer,
    getHasAnsweredAll,
    getCanGoNext,
    getCanGoPrevious,
    getProgress,
    getAnsweredCount,
    getFormattedTime,
  } = useQuizStore();
  const { currentVideo } = useNotesStore();
  useEffect(() => {
    if (currentVideo?.id && currentVideo?.title && currentVideo?.description) {
      setVideoContext(
        currentVideo.id,
        currentVideo.title,
        currentVideo.description,
      );
    }
  }, [currentVideo, setVideoContext]);

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const hasAnsweredAll = getHasAnsweredAll();
  const canGoNext = getCanGoNext();
  const canGoPrevious = getCanGoPrevious();
  const progress = getProgress();
  const answeredCount = getAnsweredCount();
  const formattedTime = getFormattedTime();

  const handleAnswerSelect = (selectedAnswer: IQuizAnswerOption) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, selectedAnswer);
    }
  };

  const getQuizState = () => ({
    hasQuestions: questions.length > 0,
    showResults: showResults && !!feedback,
    showWelcome: questions.length === 0,
    showQuiz: questions.length > 0 && !showResults,
  });

  return {
    questions,
    answers,
    currentQuestionIndex,
    showResults,
    feedback,
    isGenerating,
    isEvaluating,
    currentQuestion,
    currentAnswer,
    hasAnsweredAll,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,
    formattedTime,

    generateQuestions,
    handleAnswerSelect,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,

    quizState: getQuizState(),
  };
};
