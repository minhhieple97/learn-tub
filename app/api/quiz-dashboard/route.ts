import { NextRequest } from "next/server";
import { z } from "zod";
import { getQuizDashboardData } from "@/features/dashboard/queries/quiz-dashboard-queries";
import { IQuizFilters } from "@/features/dashboard/types";
import {
  RESPONSE_HEADERS,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "@/config/constants";
import { getProfileInSession } from "@/features/profile/queries";

const QuizDashboardQuerySchema = z.object({
  search: z.string().optional(),
  difficulty: z
    .enum(["all", "easy", "medium", "hard"])
    .optional()
    .default("all"),
  videoId: z.string().optional(),
  sortBy: z
    .enum(["created_at", "score", "difficulty"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      search: searchParams.get("search") || undefined,
      difficulty: searchParams.get("difficulty"),
      videoId:
        searchParams.get("videoId") === "all"
          ? undefined
          : searchParams.get("videoId"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    };

    const validationResult = QuizDashboardQuerySchema.safeParse(queryParams);

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
          status: HTTP_STATUS.BAD_REQUEST,
          headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
        },
      );
    }

    const profile = await getProfileInSession();

    if (!profile) {
      return new Response(ERROR_MESSAGES.UNAUTHORIZED, {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const { search, difficulty, videoId, sortBy, sortOrder, page, limit } =
      validationResult.data;

    const filters: Partial<IQuizFilters> = {
      search,
      difficulty: difficulty as IQuizFilters["difficulty"],
      videoId,
      sortBy: sortBy as IQuizFilters["sortBy"],
      sortOrder: sortOrder as IQuizFilters["sortOrder"],
      page,
      limit,
    };

    const data = await getQuizDashboardData(profile.id, filters);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
    });
  } catch (error) {
    console.error("Quiz dashboard API error:", error);
    return new Response(
      JSON.stringify({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": RESPONSE_HEADERS.JSON_CONTENT_TYPE },
      },
    );
  }
}
