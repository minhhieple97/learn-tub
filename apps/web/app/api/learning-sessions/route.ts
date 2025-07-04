import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import {
  getLearningSessionByVideoId,
  createLearningSession,
  updateLearningSessionByVideoId,
  getUserLearningSessions,
} from "@/features/videos/queries/learning-sessions";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const getSessionsQuerySchema = z.object({
  videoId: z.string().uuid().nullable().optional(),
  limit: z.string().transform(Number).nullable().optional(),
});

const createSessionSchema = z.object({
  video_id: z.string().uuid(),
  duration_seconds: z.number().optional(),
  progress_seconds: z.number().optional(),
});

const updateSessionSchema = z.object({
  video_id: z.string().uuid(),
  duration_seconds: z.number().optional(),
  progress_seconds: z.number().optional(),
  completed: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const { searchParams } = new URL(request.url);
    const params = getSessionsQuerySchema.parse({
      videoId: searchParams.get("videoId"),
      limit: searchParams.get("limit"),
    });

    if (params.videoId) {
      const session = await getLearningSessionByVideoId(
        params.videoId,
        user.id,
      );
      return NextResponse.json({
        success: true,
        data: session,
      });
    }

    const sessions = await getUserLearningSessions(user.id, params.limit || 50);
    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching learning sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body = await request.json();
    const sessionData = createSessionSchema.parse(body);

    // Check if session already exists
    const existingSession = await getLearningSessionByVideoId(
      sessionData.video_id,
      user.id,
    );

    if (existingSession) {
      // Update existing session
      const updatedSession = await updateLearningSessionByVideoId(
        sessionData.video_id,
        user.id,
        {
          duration_seconds: sessionData.duration_seconds,
          progress_seconds: sessionData.progress_seconds,
        },
      );

      return NextResponse.json({
        success: true,
        data: updatedSession,
      });
    }

    // Create new session
    const newSession = await createLearningSession({
      user_id: user.id,
      video_id: sessionData.video_id,
      duration_seconds: sessionData.duration_seconds || 0,
      progress_seconds: sessionData.progress_seconds || 0,
    });

    return NextResponse.json({
      success: true,
      data: newSession,
    });
  } catch (error) {
    console.error("Error creating/updating learning session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const body = await request.json();
    const updateData = updateSessionSchema.parse(body);

    const updatedSession = await updateLearningSessionByVideoId(
      updateData.video_id,
      user.id,
      {
        duration_seconds: updateData.duration_seconds,
        progress_seconds: updateData.progress_seconds,
        completed: updateData.completed,
      },
    );

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    console.error("Error updating learning session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
