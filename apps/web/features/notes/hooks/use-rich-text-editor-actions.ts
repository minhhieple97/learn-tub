"use client";

import { useCallback, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import {
  MEDIA_UPLOAD,
  RICH_TEXT_EDITOR,
  TOAST_MESSAGES,
} from "@/features/notes/constants";
import {
  captureAndSaveScreenshotAction,
  uploadScreenshotAction,
  handleImagePasteAction,
  deleteImageAction,
} from "@/features/notes/actions/media-actions";
import { Editor } from "@tiptap/react";

type IUseRichTextEditorActionsProps = {
  videoId: string;
  videoTitle?: string;
  noteId?: string;
  videoElement?: HTMLVideoElement | null;
  disabled?: boolean;
};

type IUseRichTextEditorActionsReturn = {
  isCapturingScreenshot: boolean;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleScreenshot: (editor: Editor) => Promise<void>;
  handleImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    editor: Editor,
  ) => Promise<void>;
  handleImagePaste: (event: ClipboardEvent, editor: Editor) => Promise<boolean>;
  handleImageDelete: (imageUrl: string, editor: Editor) => Promise<void>;
  handleManualImageDelete: (imageUrl: string) => Promise<void>;
  triggerImageUpload: () => void;
  validateImageFile: (file: File) => boolean;
  resetFileInput: () => void;
};

export const useRichTextEditorActions = ({
  videoId,
  videoTitle,
  noteId,
  videoElement,
  disabled = false,
}: IUseRichTextEditorActionsProps): IUseRichTextEditorActionsReturn => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const { executeAsync: executeScreenshotCapture } = useAction(
    captureAndSaveScreenshotAction,
  );
  const { executeAsync: executeImageUpload } = useAction(
    uploadScreenshotAction,
  );
  const { executeAsync: executeImagePaste } = useAction(handleImagePasteAction);
  const { executeAsync: executeImageDelete } = useAction(deleteImageAction);

  const validateImageFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error({
        description: TOAST_MESSAGES.INVALID_FILE_TYPE,
      });
      return false;
    }

    if (file.size > MEDIA_UPLOAD.MAX_FILE_SIZE) {
      toast.error({
        description: TOAST_MESSAGES.FILE_TOO_LARGE,
      });
      return false;
    }

    return true;
  }, []);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const captureVideoFrame = useCallback(
    (
      video: HTMLVideoElement,
    ): Promise<{
      fileData: string;
      fileName: string;
      fileSize: number;
      width: number;
      height: number;
    }> => {
      return new Promise((resolve, reject) => {
        try {
          if (!video || video.readyState < 2) {
            throw new Error("Video not ready for screenshot");
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Could not get canvas context");
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create screenshot blob"));
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const fileName = `screenshot-${Date.now()}.png`;
                resolve({
                  fileData: reader.result as string,
                  fileName,
                  fileSize: blob.size,
                  width: canvas.width,
                  height: canvas.height,
                });
              };
              reader.onerror = () => reject(new Error("Failed to read blob"));
              reader.readAsDataURL(blob);
            },
            "image/png",
            RICH_TEXT_EDITOR.SCREENSHOT_QUALITY,
          );
        } catch (error) {
          reject(error);
        }
      });
    },
    [],
  );

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleScreenshot = useCallback(
    async (editor: Editor) => {
      if (!videoElement || !editor || disabled) {
        toast.error({
          description: TOAST_MESSAGES.SCREENSHOT_NOT_READY,
        });
        return;
      }

      setIsCapturingScreenshot(true);

      try {
        const captureData = await captureVideoFrame(videoElement);

        const result = await executeScreenshotCapture({
          videoId,
          fileData: captureData.fileData,
          fileName: captureData.fileName,
          fileSize: captureData.fileSize,
          width: captureData.width,
          height: captureData.height,
          timestamp: videoElement.currentTime,
          videoTitle,
          noteId,
        });

        if (result.data?.success && result.data?.data?.publicUrl) {
          editor
            .chain()
            .focus()
            .setImage({ src: result.data.data.publicUrl })
            .run();
          toast.success({
            description: TOAST_MESSAGES.SCREENSHOT_SUCCESS,
          });
        }
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        toast.error({
          description: TOAST_MESSAGES.SCREENSHOT_ERROR,
        });
      } finally {
        setIsCapturingScreenshot(false);
      }
    },
    [
      videoElement,
      videoId,
      videoTitle,
      noteId,
      disabled,
      captureVideoFrame,
      executeScreenshotCapture,
    ],
  );

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, editor: Editor) => {
      const file = event.target.files?.[0];
      if (!file || !editor || disabled) return;

      if (!validateImageFile(file)) {
        resetFileInput();
        return;
      }

      setIsUploadingImage(true);

      try {
        const fileData = await convertFileToBase64(file);

        const result = await executeImageUpload({
          fileData,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });

        if (result?.data?.success && result.data?.data) {
          editor
            .chain()
            .focus()
            .setImage({ src: result.data.data.publicUrl })
            .run();
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error({
          description: TOAST_MESSAGES.IMAGE_UPLOAD_ERROR,
        });
      } finally {
        setIsUploadingImage(false);
        resetFileInput();
      }
    },
    [
      disabled,
      validateImageFile,
      resetFileInput,
      convertFileToBase64,
      executeImageUpload,
    ],
  );

  const handleImagePasteCallback = useCallback(
    async (event: ClipboardEvent, editor: Editor): Promise<boolean> => {
      if (disabled || !editor) return false;

      const items = event.clipboardData?.items;
      if (!items) return false;

      // Check if clipboard contains images
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          try {
            const file = item.getAsFile();
            if (!file) continue;

            const fileData = await convertFileToBase64(file);

            const result = await executeImagePaste({
              fileData,
              fileName: `pasted-image-${Date.now()}.${file.type.split("/")[1]}`,
              fileSize: file.size,
              mimeType: file.type,
            });

            if (result?.data?.success && result.data.data) {
              editor
                .chain()
                .focus()
                .setImage({ src: result.data.data.publicUrl })
                .run();
            }
            return true; // Prevent default paste behavior
          } catch (error) {
            console.error("Error pasting image:", error);
            toast.error({
              description: TOAST_MESSAGES.IMAGE_PASTE_ERROR,
            });
            return true; // Still prevent default behavior
          }
        }
      }

      return false; // Let default paste behavior handle text
    },
    [disabled, convertFileToBase64, executeImagePaste],
  );

  const handleImageDelete = useCallback(
    async (imageUrl: string, editor: Editor) => {
      if (!editor || disabled) return;

      setIsDeletingImage(true);

      try {
        // Extract storage path from URL
        const url = new URL(imageUrl);
        const storagePath = url.pathname.split("/").slice(-3).join("/"); // Extract the path after bucket name

        const result = await executeImageDelete({
          imageUrl,
          storagePath,
        });

        if (result?.data?.success) {
          // Remove the image from the editor
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.src === imageUrl) {
              const transaction = state.tr.delete(pos, pos + node.nodeSize);
              dispatch(transaction);
              return false; // Stop traversing
            }
          });
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error({
          description: TOAST_MESSAGES.IMAGE_DELETE_ERROR,
        });
      } finally {
        setIsDeletingImage(false);
      }
    },
    [disabled, executeImageDelete],
  );

  const handleManualImageDelete = useCallback(
    async (imageUrl: string) => {
      if (disabled) return;
      try {
        const url = new URL(imageUrl);
        const storagePath = url.pathname.split("/").slice(-3).join("/");
        await executeImageDelete({
          imageUrl,
          storagePath,
        });
      } catch (error) {
        console.error("Error cleaning up deleted image:", error);
      }
    },
    [disabled, executeImageDelete],
  );

  const triggerImageUpload = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return {
    isCapturingScreenshot,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    handleScreenshot,
    handleImageUpload,
    handleImagePaste: handleImagePasteCallback,
    handleImageDelete,
    handleManualImageDelete,
    triggerImageUpload,
    validateImageFile,
    resetFileInput,
  };
};
