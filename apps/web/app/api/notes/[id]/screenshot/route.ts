import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import {
  getNoteById,
  getMediaFileById,
  linkMediaToNote,
  getNoteMediaByNoteId,
  unlinkMediaFromNote,
} from "@/features/notes/queries";
import { StatusCodes } from "http-status-codes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const noteId = (await params).id;
    const body = await request.json();
    const { mediaFileId, position } = body;

    if (!mediaFileId) {
      return NextResponse.json(
        { error: "Media file ID is required" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const note = await getNoteById(noteId, user.id);
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const { data: mediaFile, error: mediaError } = await getMediaFileById(
      mediaFileId,
      user.id,
    );
    if (mediaError || !mediaFile) {
      return NextResponse.json(
        { error: "Media file not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const { data: noteMedia, error: linkError } = await linkMediaToNote(
      noteId,
      mediaFileId,
      position,
    );
    if (linkError) {
      return NextResponse.json(
        { error: `Failed to link media to note: ${linkError.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      data: noteMedia,
    });
  } catch (error) {
    console.error("Error linking screenshot to note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const noteId = (await params).id;

    const { data: noteMedia, error: noteMediaError } =
      await getNoteMediaByNoteId(noteId, user.id);
    if (noteMediaError) {
      return NextResponse.json(
        { error: `Failed to fetch note media: ${noteMediaError.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      data: noteMedia,
    });
  } catch (error) {
    console.error("Error fetching note media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const noteId = (await params).id;
    const { searchParams } = new URL(request.url);
    const mediaFileId = searchParams.get("mediaFileId");

    if (!mediaFileId) {
      return NextResponse.json(
        { error: "Media file ID is required" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const { error: deleteError } = await unlinkMediaFromNote(
      noteId,
      mediaFileId,
    );
    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to unlink media from note: ${deleteError.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Media unlinked from note successfully",
    });
  } catch (error) {
    console.error("Error unlinking media from note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
