"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useEditor, Editor, ReactNodeViewRenderer } from "@tiptap/react";
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
import { ImageWithDelete } from "../components/rich-text-editor/image-with-delete";

type IUseRichTextEditorReturn = {
  editor: Editor | null;
  isCapturingScreenshot: boolean;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
  disabled: boolean;
  setVideoElementRef: (element: any) => void;
  isLoading: boolean;
};

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

    // Ensure proper serialization by explicitly defining how to convert to JSON
    addStorage() {
      return {
        ...this.parent?.(),
      };
    },

    // Override the parseHTML to ensure attrs are preserved
    parseHTML() {
      return [
        {
          tag: "img[src]",
          getAttrs: (element) => {
            const img = element as HTMLImageElement;
            return {
              src: img.getAttribute("src"),
              alt: img.getAttribute("alt"),
              title: img.getAttribute("title"),
              width: img.getAttribute("width"),
              height: img.getAttribute("height"),
            };
          },
        },
      ];
    },

    // Ensure proper rendering to HTML with all attributes
    renderHTML({ HTMLAttributes }) {
      return ["img", HTMLAttributes];
    },
  });
};

export const useRichTextEditor = (): IUseRichTextEditorReturn => {
  // Get state from store
  const {
    formContent,
    currentVideo,
    isFormLoading,
    youtubePlayer,
    setYouTubePlayer,
    setFormContent,
    videoTitle,
    noteId,
  } = useNotesStore();

  const disabled = isFormLoading;
  const placeholder = "Write your notes here...";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previousImages, setPreviousImages] = useState<string[]>([]);
  const uploadingImages = useRef<Map<string, string>>(new Map()); // blobUrl -> fileName

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

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to preload image"));
      img.src = src;
    });
  }, []);

  const captureVideoFrame = useCallback(
    (
      youtubePlayer: any,
    ): Promise<{
      fileData: string;
      fileName: string;
      fileSize: number;
      width: number;
      height: number;
    }> => {
      return new Promise((resolve, reject) => {
        try {
          if (!youtubePlayer || typeof youtubePlayer.getIframe !== "function") {
            throw new Error("YouTube player not ready for screenshot");
          }

          const iframe = youtubePlayer.getIframe();
          if (!iframe) {
            throw new Error("Could not get YouTube iframe");
          }

          const videoData = youtubePlayer.getVideoData();
          if (!videoData) {
            throw new Error("Could not get video data");
          }

          const width = 854;
          const height = 480;

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Could not get canvas context");
          }

          canvas.width = width;
          canvas.height = height;

          const currentTime = youtubePlayer.getCurrentTime();
          const duration = youtubePlayer.getDuration();

          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);

          ctx.fillStyle = "#ffffff";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("YouTube Screenshot", width / 2, height / 2 - 40);

          ctx.font = "18px Arial";
          const timeText = `${Math.floor(currentTime / 60)}:${Math.floor(
            currentTime % 60,
          )
            .toString()
            .padStart(2, "0")} / ${Math.floor(duration / 60)}:${Math.floor(
            duration % 60,
          )
            .toString()
            .padStart(2, "0")}`;
          ctx.fillText(timeText, width / 2, height / 2);

          if (videoData.title) {
            ctx.font = "16px Arial";
            ctx.fillText(
              videoData.title.substring(0, 50) +
                (videoData.title.length > 50 ? "..." : ""),
              width / 2,
              height / 2 + 30,
            );
          }

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

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, editor: Editor) => {
      const file = event.target.files?.[0];

      if (!file || !editor || disabled) return;

      if (!validateImageFile(file)) {
        resetFileInput();
        return;
      }

      // Create blob URL for immediate display
      const blobUrl = URL.createObjectURL(file);

      // Track this upload
      uploadingImages.current.set(blobUrl, file.name);

      // Insert image immediately with blob URL
      editor
        .chain()
        .focus()
        .setImage({
          src: blobUrl,
          alt: file.name,
          title: `Uploading: ${file.name}`,
        })
        .run();

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
          const imageUrl = result.data.data.publicUrl;

          try {
            // Preload the server image to ensure smooth transition
            await preloadImage(imageUrl);

            // Find and update the image with the server URL
            const { state, dispatch } = editor.view;
            const { doc } = state;
            let transaction = state.tr;

            doc.descendants((node, pos) => {
              if (node.type.name === "image" && node.attrs.src === blobUrl) {
                transaction = transaction.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  src: imageUrl,
                  title: `Uploaded image: ${file.name}`,
                });
                return false; // Stop after finding the first match
              }
            });

            dispatch(transaction);

            // Clean up
            uploadingImages.current.delete(blobUrl);
            URL.revokeObjectURL(blobUrl);
          } catch (preloadError) {
            console.warn(
              "Failed to preload image, updating anyway:",
              preloadError,
            );
            // Fallback: update even if preload fails
            const { state, dispatch } = editor.view;
            const { doc } = state;
            let transaction = state.tr;

            doc.descendants((node, pos) => {
              if (node.type.name === "image" && node.attrs.src === blobUrl) {
                transaction = transaction.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  src: imageUrl,
                  title: `Uploaded image: ${file.name}`,
                });
                return false;
              }
            });

            dispatch(transaction);
            uploadingImages.current.delete(blobUrl);
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        // Remove the failed upload image
        const { state, dispatch } = editor.view;
        const { doc } = state;
        let transaction = state.tr;

        doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.src === blobUrl) {
            transaction = transaction.delete(pos, pos + node.nodeSize);
            return false;
          }
        });

        dispatch(transaction);

        // Clean up
        uploadingImages.current.delete(blobUrl);
        URL.revokeObjectURL(blobUrl);

        toast.error({
          description: `Image upload failed: ${errorMessage}`,
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
      preloadImage,
    ],
  );

  const handleImagePaste = useCallback(
    async (event: ClipboardEvent, editor: Editor): Promise<boolean> => {
      if (disabled || !editor) return false;

      const items = event.clipboardData?.items;
      if (!items) return false;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;

          // Create blob URL for immediate display
          const blobUrl = URL.createObjectURL(file);
          const fileName = `pasted-image-${Date.now()}.${file.type.split("/")[1]}`;

          try {
            // Track this upload
            uploadingImages.current.set(blobUrl, fileName);

            // Insert image immediately with blob URL
            editor
              .chain()
              .focus()
              .setImage({
                src: blobUrl,
                alt: "Pasted image",
                title: `Uploading: ${fileName}`,
              })
              .run();

            // Upload in background
            const fileData = await convertFileToBase64(file);

            const result = await executeImagePaste({
              fileData,
              fileName,
              fileSize: file.size,
              mimeType: file.type,
            });

            if (result?.data?.success && result.data.data) {
              const imageUrl = result.data.data.publicUrl;

              try {
                // Preload the server image to ensure smooth transition
                await preloadImage(imageUrl);

                // Find and update the image with the server URL
                const { state, dispatch } = editor.view;
                const { doc } = state;
                let transaction = state.tr;

                doc.descendants((node, pos) => {
                  if (
                    node.type.name === "image" &&
                    node.attrs.src === blobUrl
                  ) {
                    transaction = transaction.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      src: imageUrl,
                      title: `Pasted image: ${fileName}`,
                    });
                    return false;
                  }
                });

                dispatch(transaction);

                uploadingImages.current.delete(blobUrl);
                URL.revokeObjectURL(blobUrl);
              } catch (preloadError) {
                console.warn(
                  "Failed to preload pasted image, updating anyway:",
                  preloadError,
                );
                // Fallback: update even if preload fails
                const { state, dispatch } = editor.view;
                const { doc } = state;
                let transaction = state.tr;

                doc.descendants((node, pos) => {
                  if (
                    node.type.name === "image" &&
                    node.attrs.src === blobUrl
                  ) {
                    transaction = transaction.setNodeMarkup(pos, undefined, {
                      ...node.attrs,
                      src: imageUrl,
                      title: `Pasted image: ${fileName}`,
                    });
                    return false;
                  }
                });

                dispatch(transaction);
                uploadingImages.current.delete(blobUrl);
                URL.revokeObjectURL(blobUrl);
              }
            } else {
              throw new Error("Failed to upload pasted image");
            }

            return true;
          } catch (error) {
            console.error("Error pasting image:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";

            const { state, dispatch } = editor.view;
            const { doc } = state;
            let transaction = state.tr;

            doc.descendants((node, pos) => {
              if (node.type.name === "image" && node.attrs.src === blobUrl) {
                transaction = transaction.delete(pos, pos + node.nodeSize);
                return false;
              }
            });

            dispatch(transaction);

            // Clean up
            uploadingImages.current.delete(blobUrl);
            URL.revokeObjectURL(blobUrl);

            toast.error({
              description: `Image paste failed: ${errorMessage}`,
            });
            return true;
          }
        }
      }

      return false;
    },
    [disabled, convertFileToBase64, executeImagePaste, preloadImage],
  );

  const handleImageDelete = useCallback(
    async (imageUrl: string, editor: Editor) => {
      if (!editor || disabled) return;

      setIsDeletingImage(true);

      try {
        const url = new URL(imageUrl);
        const storagePath = url.pathname.split("/").slice(-3).join("/");

        const result = await executeImageDelete({
          imageUrl,
          storagePath,
        });

        if (result?.data?.success) {
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.src === imageUrl) {
              const transaction = state.tr.delete(pos, pos + node.nodeSize);
              dispatch(transaction);
              return false;
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

  const CustomImage = useMemo(() => {
    return createImageExtension(
      handleImageDelete,
      handleManualImageDelete,
      disabled,
      ImageWithDelete,
    );
  }, [handleImageDelete, handleManualImageDelete, disabled]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm my-4 block",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: formContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setFormContent(json);

      const currentImages: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image" && node.attrs?.src) {
          // Only track completed uploads (not blob URLs that are still uploading)
          const isUploadingImage = uploadingImages.current.has(node.attrs.src);
          if (!isUploadingImage) {
            currentImages.push(node.attrs.src);
          }
        }
      });

      // Find images that were removed (only track server URLs, not blob URLs)
      const removedImages = previousImages.filter(
        (src) => !currentImages.includes(src) && !src.startsWith("blob:"),
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
        class: `${RICH_TEXT_EDITOR.PROSE_CLASSES} prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-sm prose-img:my-4`,
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

  useEffect(() => {
    if (editor && formContent) {
      const currentEditorContent = editor.getJSON();
      const isContentDifferent =
        JSON.stringify(currentEditorContent) !== JSON.stringify(formContent);

      if (isContentDifferent) {
        setTimeout(() => {
          editor.commands.setContent(formContent);
        }, 0);
      }
    }
  }, [editor, formContent]);

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

  const testImageInsertion = useCallback(() => {
    if (!editor) {
      console.error("❌ Editor not available for test");
      return;
    }

    console.log("🧪 Testing image insertion...");

    const testImageUrl =
      "https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Screenshot";

    try {
      const result = editor
        .chain()
        .focus()
        .setImage({
          src: testImageUrl,
          alt: "Test screenshot",
          title: "Test screenshot for debugging",
        })
        .run();

      console.log("🧪 Test insertion result:", result);
      console.log("🧪 Editor HTML after test:", editor.getHTML());

      const hasTestImage = editor.getHTML().includes(testImageUrl);
      console.log("🧪 Test image found in editor:", hasTestImage);

      if (!hasTestImage) {
        toast.error({ description: "Test image insertion failed" });
      }
    } catch (error) {
      console.error("🧪 Test insertion error:", error);
      toast.error({ description: "Test image insertion error" });
    }
  }, [editor]);

  if (typeof window !== "undefined") {
    (window as any).testImageInsertion = testImageInsertion;
  }

  const setVideoElementRef = useCallback(
    (player: any) => {
      setYouTubePlayer(player);
    },
    [setYouTubePlayer],
  );

  return {
    disabled,
    setVideoElementRef,
    isLoading: isFormLoading,

    editor,
    isCapturingScreenshot,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    onImageUpload,
    triggerImageUpload,
  };
};
