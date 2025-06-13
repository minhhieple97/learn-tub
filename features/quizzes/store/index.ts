'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  IQuizQuestion,
  IUserAnswer,
  IQuizFeedback,
  IQuizSettings,
  IQuizAnswerOption,
  IQuizSessionWithAttempts,
  IQuizSession,
} from '../types';
import { generateQuizQuestionsAction, evaluateQuizAction } from '../actions';
import { AI_QUIZ_CONFIG } from '@/config/constants';
import { toast } from '@/hooks/use-toast';

type QuizState = {
  questions: IQuizQuestion[];
  answers: IUserAnswer[];
  currentQuestionIndex: number;
  sessionId: string | null;
  showResults: boolean;
  feedback: IQuizFeedback | null;

  isGenerating: boolean;
  isEvaluating: boolean;

  settings: IQuizSettings;

  startTime: number | null;
  currentTime: number;
  timeTakenSeconds: number;
  timerInterval: NodeJS.Timeout | null;

  isRetakeMode: boolean;
  retakeSession: IQuizSession | null;

  videoId: string | null;
  videoTitle?: string;
  videoDescription?: string;
  videoTutorial?: string;

  setVideoContext: (
    videoId: string,
    title?: string,
    description?: string,
    tutorial?: string,
  ) => void;
  updateSettings: (settings: Partial<IQuizSettings>) => void;
  generateQuestions: () => Promise<void>;
  answerQuestion: (questionId: string, selectedAnswer: IQuizAnswerOption) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;

  startTimer: () => void;
  stopTimer: () => void;

  initializeRetake: (session: IQuizSessionWithAttempts) => void;
  resetRetake: () => void;

  getCurrentQuestion: () => IQuizQuestion | null;
  getCurrentAnswer: () => IUserAnswer | null;
  getHasAnsweredAll: () => boolean;
  getCanGoNext: () => boolean;
  getCanGoPrevious: () => boolean;
  getProgress: () => number;
  getAnsweredCount: () => number;
  getFormattedTime: () => string;
  getFormattedTimeTaken: () => string;
};

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => {
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
          }
        });
      }

      return {
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        sessionId: null,
        showResults: false,
        feedback: null,
        isGenerating: false,
        isEvaluating: false,
        settings: {
          questionCount: AI_QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
          difficulty: AI_QUIZ_CONFIG.DEFAULT_DIFFICULTY,
          provider: null,
          aiModelId: '',
        },
        startTime: null,
        currentTime: 0,
        timeTakenSeconds: 0,
        timerInterval: null,
        isRetakeMode: false,
        retakeSession: null,
        videoId: null,
        videoTitle: undefined,
        videoDescription: undefined,
        videoTutorial: undefined,

        setVideoContext: (
          videoId: string,
          title?: string,
          description?: string,
          tutorial?: string,
        ) => {
          set({
            videoId,
            videoTitle: title,
            videoDescription: description,
            videoTutorial: tutorial,
          });
        },

        updateSettings: (newSettings: Partial<IQuizSettings>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },

        generateQuestions: async () => {
          const { videoId, videoTitle, videoDescription, videoTutorial, settings } = get();

          if (!videoId) {
            toast.error({ description: 'Video ID is required' });
            return;
          }

          if (!settings.aiModelId) {
            toast.error({ description: 'Please select an AI model to generate questions' });
            return;
          }

          set({ isGenerating: true });

          try {
            const result = await generateQuizQuestionsAction({
              videoId,
              videoTitle,
              videoDescription,
              videoTutorial,
              questionCount: settings.questionCount,
              difficulty: settings.difficulty,
              aiModelId: settings.aiModelId,
            });
            console.log('result', result);
            if (result?.data?.success) {
              set({
                questions: result.data.questions || [],
                answers: [],
                currentQuestionIndex: 0,
                showResults: false,
                feedback: null,
                sessionId: result.data.sessionId || null,
                startTime: null,
                currentTime: 0,
                timeTakenSeconds: 0,
                isGenerating: false,
              });

              get().startTimer();

              toast.success({ description: 'Quiz questions generated successfully!' });
            } else {
              throw new Error(result?.serverError || 'Failed to generate questions');
            }
          } catch (error) {
            console.error('Failed to generate questions:', error);
            toast.error({
              description: error instanceof Error ? error.message : 'Failed to generate questions',
            });
            set({ isGenerating: false });
          }
        },

        answerQuestion: (questionId: string, selectedAnswer: IQuizAnswerOption) => {
          set((state) => {
            const existingAnswerIndex = state.answers.findIndex((a) => a.questionId === questionId);
            const newAnswers = [...state.answers];

            if (existingAnswerIndex >= 0) {
              newAnswers[existingAnswerIndex] = { questionId, selectedAnswer };
            } else {
              newAnswers.push({ questionId, selectedAnswer });
            }

            return { answers: newAnswers };
          });
        },

        nextQuestion: () => {
          set((state) => ({
            currentQuestionIndex: Math.min(
              state.currentQuestionIndex + 1,
              state.questions.length - 1,
            ),
          }));
        },

        previousQuestion: () => {
          set((state) => ({
            currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
          }));
        },

        goToQuestion: (index: number) => {
          set((state) => ({
            currentQuestionIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
          }));
        },

        submitQuiz: async () => {
          const {
            videoId,
            videoTitle,
            videoDescription,
            videoTutorial,
            questions,
            answers,
            settings,
            sessionId,
            startTime,
            timeTakenSeconds,
          } = get();
          if (questions.length === 0 || answers.length === 0) {
            toast.error({ description: 'Please answer all questions before submitting' });
            return;
          }

          if (!videoId || !sessionId) {
            toast.error({ description: 'Missing required data for submission' });
            return;
          }

          set({ isEvaluating: true });
          get().stopTimer();

          const finalTimeTaken = startTime
            ? Math.floor((Date.now() - startTime) / 1000)
            : timeTakenSeconds;

          try {
            const result = await evaluateQuizAction({
              videoId,
              questions,
              answers,
              videoContext: {
                title: videoTitle,
                description: videoDescription,
                tutorial: videoTutorial,
              },
              aiModelId: settings.aiModelId,
              quizSessionId: sessionId,
              timeTakenSeconds: finalTimeTaken,
            });

            if (result?.data?.success) {
              set({
                feedback: result.data.feedback || null,
                showResults: true,
                isEvaluating: false,
                timeTakenSeconds: finalTimeTaken,
              });

              toast.success({ description: 'Quiz submitted successfully!' });
            } else {
              throw new Error(result?.serverError || 'Failed to evaluate quiz');
            }
          } catch (error) {
            console.error('Failed to evaluate quiz:', error);
            toast.error({
              description: error instanceof Error ? error.message : 'Failed to evaluate quiz',
            });
            set({ isEvaluating: false });
          }
        },

        resetQuiz: () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          set({
            questions: [],
            answers: [],
            currentQuestionIndex: 0,
            sessionId: null,
            showResults: false,
            feedback: null,
            startTime: null,
            currentTime: 0,
            timeTakenSeconds: 0,
            timerInterval: null,
            isRetakeMode: false,
            retakeSession: null,
            videoId: null,
            videoTitle: undefined,
            videoDescription: undefined,
            videoTutorial: undefined,
          });
        },

        // Timer actions
        startTimer: () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          const startTime = Date.now();
          set({ startTime, currentTime: 0 });

          const interval = setInterval(() => {
            set((state) => {
              if (state.startTime) {
                const currentTime = Math.floor((Date.now() - state.startTime) / 1000);
                return { currentTime };
              }
              return state;
            });
          }, 1000);

          set({ timerInterval: interval });
        },

        stopTimer: () => {
          const { timerInterval, startTime } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
            set({ timerInterval: null });
          }

          if (startTime) {
            const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
            set({ timeTakenSeconds });
          }
        },

        // Retake actions
        initializeRetake: (session: IQuizSessionWithAttempts) => {
          set({
            isRetakeMode: true,
            retakeSession: session,
            questions: session.questions as IQuizQuestion[],
            answers: [],
            currentQuestionIndex: 0,
            sessionId: session.id,
            showResults: false,
            feedback: null,
            startTime: null,
            currentTime: 0,
            timeTakenSeconds: 0,
            settings: {
              questionCount: session.question_count,
              difficulty: session.difficulty,
              provider: session.provider_name || null,
              aiModelId: session.ai_model_id || '',
            },
            videoId: session.video_id,
            videoTitle: session.videos?.title,
            videoDescription: session.videos?.description,
          });
        },

        resetRetake: () => {
          const { timerInterval } = get();
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          set((state) => ({
            ...state,
            answers: [],
            currentQuestionIndex: 0,
            showResults: false,
            feedback: null,
            startTime: null,
            currentTime: 0,
            timeTakenSeconds: 0,
            timerInterval: null,
          }));
        },

        // Computed getters
        getCurrentQuestion: () => {
          const { questions, currentQuestionIndex } = get();
          return questions[currentQuestionIndex] || null;
        },

        getCurrentAnswer: () => {
          const { answers } = get();
          const currentQuestion = get().getCurrentQuestion();
          if (!currentQuestion) return null;
          return answers.find((a) => a.questionId === currentQuestion.id) || null;
        },

        getHasAnsweredAll: () => {
          const { answers, questions } = get();
          return answers.length === questions.length;
        },

        getCanGoNext: () => {
          const { currentQuestionIndex, questions } = get();
          return currentQuestionIndex < questions.length - 1;
        },

        getCanGoPrevious: () => {
          const { currentQuestionIndex } = get();
          return currentQuestionIndex > 0;
        },

        getProgress: () => {
          const { currentQuestionIndex, questions } = get();
          return questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
        },

        getAnsweredCount: () => {
          const { answers } = get();
          return answers.length;
        },

        getFormattedTime: () => {
          const { currentTime } = get();
          const mins = Math.floor(currentTime / 60);
          const secs = currentTime % 60;
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        getFormattedTimeTaken: () => {
          const { timeTakenSeconds } = get();
          const mins = Math.floor(timeTakenSeconds / 60);
          const secs = timeTakenSeconds % 60;
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
      };
    },
    {
      name: 'quiz-store',
    },
  ),
);
