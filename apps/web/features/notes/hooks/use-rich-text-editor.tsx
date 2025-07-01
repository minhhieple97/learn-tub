"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  useEditor,
  Editor,
  ReactNodeViewRenderer,
  JSONContent,
} from "@tiptap/react";
import { useAction } from "next-safe-action/hooks";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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
import { useNotesStore } from "../store";
import { IUseRichTextEditorHookReturn } from "../types";

type UseRichTextEditorReturn = IUseRichTextEditorHookReturn & {
  editor: Editor | null;
  isCapturingScreenshot: boolean;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onScreenshotClick: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
};

// Create custom Image extension
const createImageExtension = (
  onDelete: (imageUrl: string, editor: Editor) => void,
  onManualDelete: (imageUrl: string) => void,
  disabled: boolean,
  ImageWithDelete: React.ComponentType<{
    node: any;
    deleteNode: () => void;
    disabled: boolean;
  }>,
) => {
  return Image.extend({
    addNodeView() {
      return ReactNodeViewRenderer(({ node, deleteNode, editor }) => (
        <ImageWithDelete
          node={node}
          deleteNode={() => {
            onDelete(node.attrs.src, editor);
            deleteNode();
          }}
          disabled={disabled}
        />
      ));
    },
  });
};

export const useRichTextEditor = (): UseRichTextEditorReturn => {
  // Get state from store
  const {
    formContent,
    currentVideoId,
    isFormLoading,
    youtubePlayer,
    setYouTubePlayer,
    setFormContent,
    videoTitle,
    noteId,
  } = useNotesStore();

  // Use store values directly
  const content = formContent;
  const videoId = currentVideoId;
  const videoElement = youtubePlayer;
  const disabled = isFormLoading;
  const placeholder = "Write your notes here...";

  // For now, we'll use a default ImageWithDelete component or make it optional
  const ImageWithDelete = undefined;

  // Media action states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previousImages, setPreviousImages] = useState<string[]>([]);

  // Action hooks
  const { executeAsync: executeScreenshotCapture } = useAction(
    captureAndSaveScreenshotAction,
  );
  const { executeAsync: executeImageUpload } = useAction(
    uploadScreenshotAction,
  );
  const { executeAsync: executeImagePaste } = useAction(handleImagePasteAction);
  const { executeAsync: executeImageDelete } = useAction(deleteImageAction);

  // Utility functions
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

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
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

  // Media action handlers
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

  const handleImagePaste = useCallback(
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
        const storagePath = url.pathname.split("/").slice(-3).join("/");

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

  // Create custom image extension
  const CustomImage = useMemo(() => {
    if (!ImageWithDelete) return null;

    return createImageExtension(
      handleImageDelete,
      handleManualImageDelete,
      disabled,
      ImageWithDelete,
    );
  }, [handleImageDelete, handleManualImageDelete, disabled, ImageWithDelete]);

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      ...(CustomImage
        ? [
            CustomImage.configure({
              inline: false,
              allowBase64: false,
            }),
          ]
        : [
            Image.configure({
              inline: false,
              allowBase64: false,
            }),
          ]),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: typeof content === "string" ? undefined : content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setFormContent(json);

      const currentImages: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image" && node.attrs.src) {
          currentImages.push(node.attrs.src);
        }
      });

      // Find images that were removed
      const removedImages = previousImages.filter(
        (src) => !currentImages.includes(src),
      );

      // Clean up removed images
      removedImages.forEach((imageUrl) => {
        handleManualImageDelete(imageUrl);
      });

      setPreviousImages(currentImages);
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: RICH_TEXT_EDITOR.PROSE_CLASSES,
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              handleImagePaste(event, editor as Editor);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Initialize previous images when editor content first loads
  useEffect(() => {
    if (editor && !previousImages.length) {
      const currentImages: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image" && node.attrs.src) {
          currentImages.push(node.attrs.src);
        }
      });
      setPreviousImages(currentImages);
    }
  }, [editor, previousImages.length]);

  // Event handlers for components
  const onScreenshotClick = useCallback(() => {
    if (editor) {
      handleScreenshot(editor);
    }
  }, [editor, handleScreenshot]);

  const onImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (editor) {
        handleImageUpload(event, editor);
      }
    },
    [editor, handleImageUpload],
  );

  const triggerImageUpload = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const setVideoElementRef = useCallback(
    (player: any) => {
      setYouTubePlayer(player);
    },
    [setYouTubePlayer],
  );

  return {
    // Store-based values (for backward compatibility)
    content,
    disabled,
    videoElement,
    setVideoElementRef,
    videoId,
    isLoading: isFormLoading,
    isReady: Boolean(videoId && videoElement),

    // Editor-specific values
    editor,
    isCapturingScreenshot,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    onScreenshotClick,
    onImageUpload,
    triggerImageUpload,
  };
};
