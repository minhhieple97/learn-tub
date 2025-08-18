import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import { createClient } from "@/lib/supabase/server";
import { StatusCodes } from "http-status-codes";

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

    const feedbackId = (await params).id;
    const supabase = await createClient();

    const { error } = await supabase
      .from("note_interactions")
      .delete()
      .eq("id", feedbackId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting AI feedback:", error);
      return NextResponse.json(
        { error: `Failed to delete AI feedback: ${error.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      message: "AI feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting AI feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
