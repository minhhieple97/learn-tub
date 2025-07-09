"use server";

import { revalidatePath } from "next/cache";
import { ActionError, authAction } from "@/lib/safe-action";
import {
  uploadScreenshotInputSchema,
  captureAndSaveScreenshotInputSchema,
  handleImagePasteInputSchema,
  deleteImageInputSchema,
} from "../schemas";
import {
  uploadScreenshotToStorage,
  getScreenshotPublicUrl,
  saveScreenshotMetadata,
  linkScreenshotToNote,
  deleteImageFromStorage,
} from "../queries";
import { checkProfileByUserId } from "@/lib/require-auth";

export const uploadScreenshotAction = authAction
  .inputSchema(uploadScreenshotInputSchema)
  .action(
    async ({
      parsedInput: { fileData, fileName, fileSize, mimeType },
      ctx: { user },
    }) => {
      // Convert base64 to File
      const base64Data = fileData.split(",")[1];
      if (!base64Data) {
        throw new ActionError("Invalid file data format");
      }
      const buffer = Buffer.from(base64Data, "base64");
      const file = new File([buffer], fileName, { type: mimeType });

      const { error, storagePath } = await uploadScreenshotToStorage(
        file,
        user.id,
      );

      if (error) {
        throw new ActionError(`Failed to upload screenshot: ${error.message}`);
      }

      const urlData = await getScreenshotPublicUrl(storagePath);

      return {
        success: true,
        data: {
          id: storagePath,
          publicUrl: urlData.publicUrl,
          fileName,
          fileSize,
        },
      };
    },
  );

export const captureAndSaveScreenshotAction = authAction
  .inputSchema(captureAndSaveScreenshotInputSchema)
  .action(
    async ({
      parsedInput: {
        videoId,
        fileData,
        fileName,
        fileSize,
        width,
        height,
        timestamp,
        videoTitle,
        noteId,
      },
      ctx: { user },
    }) => {
      const base64Data = fileData.split(",")[1];
      if (!base64Data) {
        throw new ActionError("Invalid file data format");
      }
      const buffer = Buffer.from(base64Data, "base64");
      const file = new File([buffer], fileName, { type: "image/png" });

      // Upload file
      const { error: uploadError, storagePath } =
        await uploadScreenshotToStorage(file, user.id);

      if (uploadError) {
        throw new ActionError(
          `Failed to upload screenshot: ${uploadError.message}`,
        );
      }

      const urlData = await getScreenshotPublicUrl(storagePath);

      // Save metadata
      const { data: metadataResult, error: metadataError } =
        await saveScreenshotMetadata({
          userId: user.id,
          videoId,
          fileName,
          fileSize,
          width,
          height,
          timestamp,
          publicUrl: urlData.publicUrl,
          storagePath,
          videoTitle,
        });

      if (metadataError) {
        throw new ActionError(
          `Failed to save screenshot metadata: ${metadataError.message}`,
        );
      }

      // Link to note if provided
      if (noteId && metadataResult) {
        const { error: linkError } = await linkScreenshotToNote(
          noteId,
          metadataResult.mediaFileId,
        );
        if (linkError) {
          throw new ActionError(
            `Failed to link screenshot to note: ${linkError.message}`,
          );
        }
      }

      revalidatePath(`/learn/${videoId}`);

      return {
        success: true,
        data: {
          id: storagePath,
          publicUrl: urlData.publicUrl,
          fileName,
          fileSize,
          mediaFileId: metadataResult?.mediaFileId || "",
        },
      };
    },
  );

export const handleImagePasteAction = authAction
  .inputSchema(handleImagePasteInputSchema)
  .action(
    async ({
      parsedInput: { fileData, fileName, fileSize, mimeType },
      ctx: { user },
    }) => {
      const profile = await checkProfileByUserId(user.id);

      // Convert base64 to File
      const base64Data = fileData.split(",")[1];
      if (!base64Data) {
        throw new ActionError("Invalid file data format");
      }
      const buffer = Buffer.from(base64Data, "base64");
      const file = new File([buffer], fileName, { type: mimeType });

      const { error, storagePath } = await uploadScreenshotToStorage(
        file,
        profile.id,
      );

      if (error) {
        throw new ActionError(`Failed to upload image: ${error.message}`);
      }

      const urlData = await getScreenshotPublicUrl(storagePath);

      return {
        success: true,
        data: {
          id: storagePath,
          publicUrl: urlData.publicUrl,
          fileName,
          fileSize,
        },
      };
    },
  );

export const deleteImageAction = authAction
  .inputSchema(deleteImageInputSchema)
  .action(async ({ parsedInput: { imageUrl, storagePath }, ctx: { user } }) => {
    const profile = await checkProfileByUserId(user.id);

    const { error } = await deleteImageFromStorage(
      imageUrl,
      storagePath,
      profile.id,
    );

    if (error) {
      throw new ActionError(`Failed to delete image: ${error.message}`);
    }

    return {
      success: true,
      message: "Image deleted successfully",
    };
  });
