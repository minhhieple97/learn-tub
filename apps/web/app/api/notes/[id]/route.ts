import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import { getNoteById, updateNote, deleteNote } from "@/features/notes/queries";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const updateNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content is too long"),
  tags: z.array(z.string().min(1).max(50)).max(10, "Too many tags").default([]),
});

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
    const note = await getNoteById(noteId, user.id);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function PUT(
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
    const { content, tags } = updateNoteSchema.parse(body);

    // Check if note exists and belongs to user
    const existingNote = await getNoteById(noteId, user.id);
    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const { error } = await updateNote({
      noteId,
      userId: user.id,
      content,
      tags,
    });

    if (error) {
      return NextResponse.json(
        { error: `Failed to update note: ${error.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error updating note:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: StatusCodes.BAD_REQUEST },
      );
    }
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

    const existingNote = await getNoteById(noteId, user.id);
    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: StatusCodes.NOT_FOUND },
      );
    }

    const { error } = await deleteNote({
      noteId,
      userId: user.id,
    });

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete note: ${error.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
