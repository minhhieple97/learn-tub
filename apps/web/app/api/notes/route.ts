import { NextRequest, NextResponse } from 'next/server';
import { getUserInSession } from '@/features/profile/queries';
import { getNotesByVideoId, getUserNotes, searchNotes, createNote } from '@/features/notes/queries';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

const getNotesQuerySchema = z.object({
  videoId: z.string().uuid().optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
});

const createNoteSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content is too long'),
  timestamp: z.number().min(0, 'Timestamp must be positive'),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Too many tags').default([]),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED });
    }

    const { searchParams } = new URL(request.url);
    const params = getNotesQuerySchema.parse({
      videoId: searchParams.get('videoId'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
    });

    let notes;

    if (params.search) {
      // Search notes
      notes = await searchNotes(user.id, params.search);
    } else if (params.videoId) {
      // Get notes for specific video
      notes = await getNotesByVideoId(params.videoId, user.id);
    } else {
      // Get user notes with optional limit
      notes = await getUserNotes(user.id, params.limit);
    }

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED });
    }

    const body = await request.json();
    const { videoId, content, timestamp, tags } = createNoteSchema.parse(body);

    const { data, error } = await createNote({
      videoId,
      userId: user.id,
      content,
      timestamp,
      tags,
    });

    if (error || !data) {
      return NextResponse.json(
        { error: `Failed to create note: ${error?.message || 'Unknown error'}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
      message: 'Note created successfully',
    });
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: StatusCodes.BAD_REQUEST },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
