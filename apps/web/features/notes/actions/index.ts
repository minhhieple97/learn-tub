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
import { checkProfileByUserId } from "@/lib/require-auth";

export const saveNoteAction = authAction
  .inputSchema(saveNoteInputSchema)
  .action(
    async ({
      parsedInput: { videoId, content, timestamp, tags },
      ctx: { user },
    }) => {
      const profile = await checkProfileByUserId(user.id);
      const { data, error } = await createNote({
        videoId,
        userId: profile.id,
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
    const profile = await checkProfileByUserId(user.id);

    const { error } = await updateNote({
      noteId,
      userId: profile.id,
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
    const profile = await checkProfileByUserId(user.id);

    const { error } = await deleteNote({
      noteId,
      userId: profile.id,
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
