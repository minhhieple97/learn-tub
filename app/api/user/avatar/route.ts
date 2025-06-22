import { NextResponse } from "next/server";
import {
  getUserInSession,
  uploadAvatarFile,
  updateProfileAvatar,
} from "@/features/profile/queries";
import { uploadAvatarSchema } from "@/features/auth/schemas";
import { StatusCodes } from "http-status-codes";

export async function POST(request: Request) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    // Validate file using Zod schema
    const validationResult = uploadAvatarSchema.safeParse({ file });

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "File validation failed",
          details: errors,
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File size too large. Please upload a file smaller than 5MB.",
        },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const uploadResult = await uploadAvatarFile(user.id, file, {
      bucket: "avatars",
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadResult.error) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    const updateResult = await updateProfileAvatar(user.id, uploadResult.url!);

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || "Failed to update profile avatar" },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
