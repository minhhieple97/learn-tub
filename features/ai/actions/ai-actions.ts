"use server"

import { ActionError, authAction } from '@/lib/safe-action';
import { aiService } from '../services/ai-service';
import {
  AnalyzeNotesSchema,
  GenerateQuizSchema,
  GenerateStudyPlanSchema,
  GetNoteFeedbackSchema,
} from '../schemas';
import { getVideoWithNotes, storeAIInteraction } from '../queries';
import { AI_INTERACTION_TYPES, AI_ACTION_ERRORS } from '@/config/constants';
import { getProfileByUserId } from '@/features/profile/queries/profile';

export const analyzeNotesAction = authAction
  .inputSchema(AnalyzeNotesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { videoId } = parsedInput;
    const profile = await getProfileByUserId(ctx.user.id);
    const videoWithNotes = await getVideoWithNotes(videoId, profile.id);
    if (!videoWithNotes) {
      throw new ActionError(AI_ACTION_ERRORS.VIDEO_NOT_FOUND);
    }

    if (videoWithNotes.notes.length === 0) {
      throw new ActionError(AI_ACTION_ERRORS.NO_NOTES_FOR_ANALYSIS);
    }

    const noteContents = videoWithNotes.notes.map((note) => note.content);
    const analysis = await aiService.analyzeNotes(noteContents, videoWithNotes.title);
    await storeAIInteraction(
      profile.id,
      AI_INTERACTION_TYPES.NOTE_ANALYSIS,
      { video_id: videoId, notes_count: videoWithNotes.notes.length },
      analysis,
    );
    return { analysis };
  });

export const generateQuizAction = authAction
  .inputSchema(GenerateQuizSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { videoId, difficulty } = parsedInput;
    const { user } = ctx;

    try {
      const videoWithNotes = await getVideoWithNotes(videoId, user.id);

      if (!videoWithNotes) {
        throw new ActionError(AI_ACTION_ERRORS.VIDEO_NOT_FOUND);
      }

      if (videoWithNotes.notes.length === 0) {
        throw new ActionError(AI_ACTION_ERRORS.NO_NOTES_FOR_QUIZ);
      }

      const noteContents = videoWithNotes.notes.map((note) => note.content);
      const quiz = await aiService.generateQuiz(noteContents, videoWithNotes.title, difficulty);

      await storeAIInteraction(
        user.id,
        AI_INTERACTION_TYPES.QUIZ_GENERATION,
        { video_id: videoId, difficulty, notes_count: videoWithNotes.notes.length },
        quiz,
      );

      return { quiz };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(AI_ACTION_ERRORS.FAILED_TO_GENERATE_QUIZ);
    }
  });

export const generateStudyPlanAction = authAction
  .inputSchema(GenerateStudyPlanSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { videoId, learningGoals } = parsedInput;
    const profile = await getProfileByUserId(ctx.user.id);

    const videoWithNotes = await getVideoWithNotes(videoId, profile.id);

    if (!videoWithNotes) {
      throw new ActionError(AI_ACTION_ERRORS.VIDEO_NOT_FOUND);
    }

    if (videoWithNotes.notes.length === 0) {
      throw new ActionError(AI_ACTION_ERRORS.NO_NOTES_FOR_STUDY_PLAN);
    }

    const noteContents = videoWithNotes.notes.map((note) => note.content);
    const studyPlan = await aiService.generateStudyPlan(
      noteContents,
      videoWithNotes.title,
      learningGoals,
    );
    await storeAIInteraction(
      profile.id,
      AI_INTERACTION_TYPES.STUDY_PLAN,
      { video_id: videoId, learning_goals: learningGoals },
      { study_plan: studyPlan },
    );

    return { studyPlan };
  });

export const getNoteFeedbackAction = authAction
  .inputSchema(GetNoteFeedbackSchema)
  .action(async ({ parsedInput }) => {
    const { noteContent, timestamp } = parsedInput;
    const feedback = await aiService.provideFeedback(noteContent, timestamp);
    return { feedback };
  });
