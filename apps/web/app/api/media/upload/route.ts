import { NextRequest, NextResponse } from "next/server";
import { getUserInSession } from "@/features/profile/queries";
import {
  uploadFileToStorage,
  getPublicUrl,
  createMediaFile,
  createVideoScreenshot,
  cleanupStorageFile,
} from "@/features/notes/queries";
import { MEDIA_UPLOAD, FILE_TYPES } from "@/features/notes/constants";
import { StatusCodes } from "http-status-codes";
import { formatTimestamp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserInSession();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType =
      (formData.get("fileType") as "image" | "video_screenshot") ||
      FILE_TYPES.IMAGE;
    const videoId = formData.get("videoId") as string;
    const timestamp = formData.get("timestamp") as string;
    const videoTitle = formData.get("videoTitle") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    if (file.size > MEDIA_UPLOAD.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: StatusCodes.BAD_REQUEST },
      );
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const { error: uploadError, storagePath } = await uploadFileToStorage(
      file,
      user.id,
      fileName,
    );

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    const urlData = await getPublicUrl(storagePath);

    const width: number | null = null;
    const height: number | null = null;

    const { data: mediaFile, error: dbError } = await createMediaFile({
      userId: user.id,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      publicUrl: urlData.publicUrl,
      width,
      height,
    });

    if (dbError || !mediaFile) {
      await cleanupStorageFile(storagePath);
      return NextResponse.json(
        {
          error: `Database error: ${dbError?.message || "Failed to create media file"}`,
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    if (fileType === FILE_TYPES.VIDEO_SCREENSHOT && videoId && timestamp) {
      const { error: screenshotError } = await createVideoScreenshot({
        mediaFileId: mediaFile.id,
        videoId,
        userId: user.id,
        timestampSeconds: parseFloat(timestamp),
        youtubeTimestamp: formatTimestamp(parseFloat(timestamp)),
        videoTitle,
      });

      if (screenshotError) {
        console.error(
          "Failed to create video screenshot record:",
          screenshotError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: mediaFile.id,
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        mediaFileId: mediaFile.id,
      },
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
