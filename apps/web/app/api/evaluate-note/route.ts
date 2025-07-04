import { NextRequest } from "next/server";
import {
  RESPONSE_HEADERS,
  CHUNK_TYPES,
  ERROR_MESSAGES,
  AI_COMMANDS,
  CREDIT_ACTION_COUNTS,
} from "@/config/constants";
import { INoteEvaluationRequest } from "@/features/notes/types";
import { IFeedback, StreamChunk } from "@/types";
import {
  createNoteInteraction,
  getNoteForEvaluation,
} from "@/features/notes/queries";
import { noteService } from "@/features/notes/services/note-service";
import { ActionError } from "@/lib/safe-action";
import { RateLimiter } from "@/lib/rate-limiter";
import {
  getProfileInSession,
  getUserInSession,
} from "@/features/profile/queries";
import { deductCredits } from "@/features/payments/services/deduction-credit";

import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { validateUserCreditsForOperation } from "@/features/payments";

const EvaluateNoteQuerySchema = z.object({
  noteId: z.string().uuid("Invalid note ID format"),
  aiModelId: z.string().uuid("Invalid AI Model ID"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      noteId: searchParams.get("noteId"),
      aiModelId: searchParams.get("aiModelId"),
    };

    const validationResult = EvaluateNoteQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: errorMessage,
        }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
        },
      );
    }

    const { noteId, aiModelId } = validationResult.data;

    const [user, profile] = await Promise.all([
      getUserInSession(),
      getProfileInSession(),
    ]);
    if (!user || !profile) {
      return new Response(ERROR_MESSAGES.UNAUTHORIZED, {
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    const rateLimitResult = await RateLimiter.checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      throw new ActionError(
        `Rate limit exceeded. Try again in a minute. Remaining: ${rateLimitResult.remaining}`,
      );
    }

    const creditValidation = await validateUserCreditsForOperation(
      profile.id,
      CREDIT_ACTION_COUNTS[
        AI_COMMANDS.EVALUATE_NOTE as keyof typeof CREDIT_ACTION_COUNTS
      ] ?? 1,
    );
    if (!creditValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          details:
            creditValidation.message ||
            "You don't have enough credits to evaluate this note",
        }),
        {
          status: StatusCodes.BAD_REQUEST,
          headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
        },
      );
    }

    const { data: note, error: noteError } = await getNoteForEvaluation(
      noteId,
      profile.id,
    );

    if (noteError || !note) {
      return new Response(ERROR_MESSAGES.NOTE_NOT_FOUND, {
        status: StatusCodes.NOT_FOUND,
      });
    }

    const evaluationRequest: INoteEvaluationRequest = {
      noteId,
      aiModelId,
      content:
        typeof note.content === "string"
          ? note.content
          : JSON.stringify(note.content || ""),
      userId: profile.id,
      context: {
        timestamp: note.timestamp_seconds,
      },
    };

    const aiStream = await noteService.evaluateNote(evaluationRequest);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = aiStream.getReader();

        try {
          let feedback: IFeedback | null = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(value)}\n\n`),
            );

            if (value.type === CHUNK_TYPES.COMPLETE && value.content) {
              try {
                feedback = JSON.parse(value.content) as IFeedback;
                await createNoteInteraction(
                  profile.id,
                  noteId,
                  aiModelId,
                  feedback,
                );

                const creditResult = await deductCredits({
                  userId: profile.id,
                  command: AI_COMMANDS.EVALUATE_NOTE as NonNullable<
                    typeof AI_COMMANDS.EVALUATE_NOTE
                  >,
                  description: `Note evaluation for note: ${noteId}`,
                  relatedActionId: noteId,
                });

                if (!creditResult.success) {
                  console.error(
                    "Failed to deduct credits:",
                    creditResult.error,
                  );
                }
              } catch (parseError) {
                console.error(
                  ERROR_MESSAGES.FAILED_TO_PARSE_AI_FEEDBACK,
                  parseError,
                );
              }
            }
          }
        } catch (error) {
          const errorChunk: StreamChunk = {
            type: CHUNK_TYPES.ERROR,
            content:
              error instanceof Error
                ? error.message
                : ERROR_MESSAGES.UNKNOWN_ERROR,
            finished: true,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": RESPONSE_HEADERS.SSE_CONTENT_TYPE,
        "Cache-Control": RESPONSE_HEADERS.CACHE_CONTROL,
        Connection: RESPONSE_HEADERS.CONNECTION,
      },
    });
  } catch (error) {
    console.error("Error in evaluate-note route:", error);
    return new Response(
      JSON.stringify({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
      },
    );
  }
}
