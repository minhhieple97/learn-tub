"use server";

import { authAction } from "@/lib/safe-action";
import { getQuizSessionForRetake } from "../queries/quiz-dashboard-queries";

import { revalidatePath } from "next/cache";
import { routes } from "@/routes";
import { RetakeQuizSchema } from "../schemas";

export const retakeQuizAction = authAction
  .inputSchema(RetakeQuizSchema)
  .action(async ({ parsedInput: { sessionId }, ctx: { user } }) => {
    const session = await getQuizSessionForRetake(sessionId, user.id);

    revalidatePath(routes.dashboard.quizzes);

    return {
      success: true,
      session,
    };
  });
