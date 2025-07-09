"use server";

import { revalidatePath } from "next/cache";
import { ActionError, authAction } from "@/lib/safe-action";
import {
  saveNoteInputSchema,
  updateNoteInputSchema,
  deleteNoteInputSchema,
} from "../schemas";
import { createNote, updateNote, deleteNote } from "../queries";
import { routes } from "@/routes";

import { z } from "zod";
import {
  AI_COMMANDS,
  CREDIT_ACTION_COUNTS,
  ERROR_MESSAGES,
} from "@/config/constants";
import { validateUserCreditsForOperation } from "@/features/payments";

import { getNoteForEvaluation } from "../queries";
import { ContentExtractor } from "../utils/content-extractor";
import { RateLimiter } from "@/lib/rate-limiter";
import { noteService } from "../services/note-service";
import type { INoteEvaluationRequest } from "../types";

const evaluateNoteInputSchema = z.object({
  noteId: z.string().uuid("Invalid note ID format"),
  aiModelId: z.string().uuid("Invalid AI Model ID"),
});

export const saveNoteAction = authAction
  .inputSchema(saveNoteInputSchema)
  .action(
    async ({
      parsedInput: { videoId, content, timestamp, tags },
      ctx: { user },
    }) => {
      const { data, error } = await createNote({
        videoId,
        userId: user.id,
        content,
        timestamp,
        tags,
      });
      if (error || !data) {
        console.error("Failed to save note:", error);
        throw new ActionError(
          `Failed to save note: ${error?.message || "Unknown error"}`,
        );
      }

      revalidatePath(`/learn/${videoId}`);

      return {
        success: true,
        noteId: data.id,
        message: "Note saved successfully",
      };
    },
  );

export const updateNoteAction = authAction
  .inputSchema(updateNoteInputSchema)
  .action(async ({ parsedInput: { noteId, content, tags }, ctx: { user } }) => {
    const { error } = await updateNote({
      noteId,
      userId: user.id,
      content,
      tags,
    });

    if (error) {
      throw new ActionError(`Failed to update note: ${error.message}`);
    }

    revalidatePath(routes.learn);

    return {
      success: true,
      noteId,
      message: "Note updated successfully",
    };
  });

export const deleteNoteAction = authAction
  .inputSchema(deleteNoteInputSchema)
  .action(async ({ parsedInput: { noteId }, ctx: { user } }) => {
    const { error } = await deleteNote({
      noteId,
      userId: user.id,
    });

    if (error) {
      throw new ActionError(`Failed to delete note: ${error.message}`);
    }

    revalidatePath(routes.learn);

    return {
      success: true,
      noteId,
      message: "Note deleted successfully",
    };
  });

export const evaluateNoteAction = authAction
  .inputSchema(evaluateNoteInputSchema)
  .action(async ({ parsedInput: { noteId, aiModelId }, ctx: { user } }) => {
    try {
      const rateLimitResult = await RateLimiter.checkRateLimit(user.id);
      if (!rateLimitResult.allowed) {
        throw new ActionError(
          `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
        );
      }

      const creditValidation = await validateUserCreditsForOperation(
        user.id,
        CREDIT_ACTION_COUNTS[AI_COMMANDS.EVALUATE_NOTE],
      );
      if (!creditValidation.success) {
        throw new ActionError(
          creditValidation.message ||
            "You don't have enough credits to evaluate this note",
        );
      }

      const { data: note, error: noteError } = await getNoteForEvaluation(
        noteId,
        user.id,
      );

      if (noteError || !note) {
        throw new ActionError(ERROR_MESSAGES.NOTE_NOT_FOUND);
      }

      const textContent = ContentExtractor.processContentForEvaluation(
        note.content,
      );

      const evaluationRequest: INoteEvaluationRequest = {
        noteId,
        content: textContent,
        aiModelId,
        userId: user.id,
        context: {
          timestamp: note.timestamp_seconds,
          videoTitle: note.videos.title,
          videoDescription: note.videos.description,
        },
      };

      const result = await noteService.evaluateNote(evaluationRequest);
      return { output: result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      throw new ActionError(errorMessage);
    }
  });
