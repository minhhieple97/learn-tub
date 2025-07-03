import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import {
  getNotesByVideoId,
  getUserNotes,
  searchNotes,
} from "@/features/notes/queries";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const getNotesQuerySchema = z.object({
  videoId: z.string().uuid().nullable().optional(),
  limit: z.string().transform(Number).nullable().optional(),
  search: z.string().nullable().optional(),
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
    const params = getNotesQuerySchema.parse({
      videoId: searchParams.get("videoId"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
    });

    if (params.search) {
      const notes = await searchNotes(user.id, params.search);
      return NextResponse.json({
        success: true,
        data: notes,
      });
    }
    if (params.videoId) {
      const notes = await getNotesByVideoId(params.videoId, user.id);
      return NextResponse.json({
        success: true,
        data: notes,
      });
    }
    const notes = await getUserNotes(user.id, params.limit || 20);
    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
