"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useEditor, Editor, ReactNodeViewRenderer } from '@tiptap/react';
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

type IUseRichTextEditorReturn = IUseRichTextEditorHookReturn & {
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

export const useRichTextEditor = (): IUseRichTextEditorReturn => {
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
  const placeholder = 'Write your notes here...';

  // For now, we'll use a default ImageWithDelete component or make it optional
  const ImageWithDelete = undefined;

  // Media action states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previousImages, setPreviousImages] = useState<string[]>([]);

  // Action hooks
  const { executeAsync: executeScreenshotCapture } = useAction(captureAndSaveScreenshotAction);
  const { executeAsync: executeImageUpload } = useAction(uploadScreenshotAction);
  const { executeAsync: executeImagePaste } = useAction(handleImagePasteAction);
  const { executeAsync: executeImageDelete } = useAction(deleteImageAction);

  // Utility functions
  const validateImageFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
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
      fileInputRef.current.value = '';
    }
  }, []);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
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
          // Check if this is a YouTube player with required methods
          if (!youtubePlayer || typeof youtubePlayer.getIframe !== 'function') {
            throw new Error('YouTube player not ready for screenshot');
          }

          const iframe = youtubePlayer.getIframe();
          if (!iframe) {
            throw new Error('Could not get YouTube iframe');
          }

          // Get video dimensions from YouTube player
          const videoData = youtubePlayer.getVideoData();
          if (!videoData) {
            throw new Error('Could not get video data');
          }

          // Use standard video dimensions (YouTube typically uses 16:9 aspect ratio)
          const width = 854; // Standard definition for screenshots
          const height = 480;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          canvas.width = width;
          canvas.height = height;

          // Since we can't directly capture from YouTube iframe due to CORS,
          // we'll create a placeholder screenshot with video information
          const currentTime = youtubePlayer.getCurrentTime();
          const duration = youtubePlayer.getDuration();

          // Fill canvas with a dark background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          // Add video title and timestamp overlay
          ctx.fillStyle = '#ffffff';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('YouTube Screenshot', width / 2, height / 2 - 40);

          ctx.font = '18px Arial';
          const timeText = `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
            .toString()
            .padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60)
            .toString()
            .padStart(2, '0')}`;
          ctx.fillText(timeText, width / 2, height / 2);

          if (videoData.title) {
            ctx.font = '16px Arial';
            ctx.fillText(
              videoData.title.substring(0, 50) + (videoData.title.length > 50 ? '...' : ''),
              width / 2,
              height / 2 + 30,
            );
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create screenshot blob'));
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
              reader.onerror = () => reject(new Error('Failed to read blob'));
              reader.readAsDataURL(blob);
            },
            'image/png',
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
      // Early validation
      if (!videoElement || !editor || disabled) {
        toast.error({
          description: TOAST_MESSAGES.SCREENSHOT_NOT_READY,
        });
        return;
      }

      // Validate YouTube player readiness
      if (typeof videoElement.getCurrentTime !== 'function') {
        toast.error({
          description: 'YouTube player is not ready for screenshot capture',
        });
        return;
      }

      setIsCapturingScreenshot(true);

      try {
        // Capture video frame
        const captureData = await captureVideoFrame(videoElement);

        // Get current timestamp from YouTube player
        const currentTime = videoElement.getCurrentTime();

        // Upload screenshot to storage
        const result = await executeScreenshotCapture({
          videoId,
          fileData: captureData.fileData,
          fileName: captureData.fileName,
          fileSize: captureData.fileSize,
          width: captureData.width,
          height: captureData.height,
          timestamp: currentTime,
          videoTitle,
          noteId,
        });

        // Auto-inject screenshot into editor
        if (result.data?.success && result.data?.data?.publicUrl) {
          const imageUrl = result.data.data.publicUrl;

          console.log('📸 Screenshot captured successfully:');
          console.log('- Image URL:', imageUrl);
          console.log('- Editor ready:', !!editor);
          console.log('- Editor can edit:', editor.isEditable);
          console.log('- Result data:', result.data.data);

          // Format timestamp for alt text
          const timeText = `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)
            .toString()
            .padStart(2, '0')}`;

          // Try multiple insertion methods to ensure image appears
          try {
            // Method 1: Try inserting at cursor position
            let insertSuccess = editor
              .chain()
              .focus()
              .setImage({
                src: imageUrl,
                alt: `Screenshot at ${timeText}`,
                title: `Video screenshot taken at ${timeText}`,
              })
              .run();

            console.log('✅ Method 1 (cursor position) result:', insertSuccess);

            // If Method 1 failed, try Method 2: Insert at end
            if (!insertSuccess) {
              insertSuccess = editor
                .chain()
                .focus('end')
                .insertContent(
                  `<p></p><img src="${imageUrl}" alt="Screenshot at ${timeText}" title="Video screenshot taken at ${timeText}" class="max-w-full h-auto rounded-lg shadow-sm my-4 block" /><p></p>`,
                )
                .run();
              console.log('✅ Method 2 (insertContent) result:', insertSuccess);
            }

            // If both methods failed, try Method 3: Direct HTML insertion
            if (!insertSuccess) {
              const currentContent = editor.getHTML();
              const newContent =
                currentContent +
                `<p><img src="${imageUrl}" alt="Screenshot at ${timeText}" title="Video screenshot taken at ${timeText}" class="max-w-full h-auto rounded-lg shadow-sm my-4 block" /></p>`;
              editor.commands.setContent(newContent);
              console.log('✅ Method 3 (setContent) applied');
            }

            console.log('📝 Editor content after insertion:', editor.getHTML());

            // Verify image was actually inserted
            const hasImage = editor.getHTML().includes(imageUrl);
            console.log('🔍 Image URL found in editor:', hasImage);

            if (!hasImage) {
              throw new Error('Image insertion failed - URL not found in editor content');
            }

            // Force editor update
            editor.commands.focus();
          } catch (insertError) {
            console.error('❌ Image insertion error:', insertError);
            const errorMessage =
              insertError instanceof Error ? insertError.message : 'Unknown insertion error';
            throw new Error(`Failed to insert image: ${errorMessage}`);
          }

          toast.success({
            description: TOAST_MESSAGES.SCREENSHOT_SUCCESS,
          });
        } else {
          console.error('❌ Screenshot upload failed:');
          console.error('- Success:', result.data?.success);
          console.error('- Public URL:', result.data?.data?.publicUrl);
          console.error('- Full result:', result);
          throw new Error('Failed to save screenshot');
        }
      } catch (error) {
        console.error('Error capturing screenshot:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error({
          description: `Screenshot failed: ${errorMessage}`,
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

      // Early validation
      if (!file || !editor || disabled) return;

      if (!validateImageFile(file)) {
        resetFileInput();
        return;
      }

      setIsUploadingImage(true);

      try {
        // Convert file to base64
        const fileData = await convertFileToBase64(file);

        // Upload image to storage
        const result = await executeImageUpload({
          fileData,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });

        // Auto-inject uploaded image into editor
        if (result?.data?.success && result.data?.data) {
          const imageUrl = result.data.data.publicUrl;

          // Focus editor and insert image at current cursor position
          editor
            .chain()
            .focus()
            .setImage({
              src: imageUrl,
              alt: file.name,
              title: `Uploaded image: ${file.name}`,
            })
            .run();
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error({
          description: `Image upload failed: ${errorMessage}`,
        });
      } finally {
        setIsUploadingImage(false);
        resetFileInput();
      }
    },
    [disabled, validateImageFile, resetFileInput, convertFileToBase64, executeImageUpload],
  );

  const handleImagePaste = useCallback(
    async (event: ClipboardEvent, editor: Editor): Promise<boolean> => {
      // Early validation
      if (disabled || !editor) return false;

      const items = event.clipboardData?.items;
      if (!items) return false;

      // Check if clipboard contains images
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          try {
            const file = item.getAsFile();
            if (!file) continue;

            // Convert pasted image to base64
            const fileData = await convertFileToBase64(file);
            const fileName = `pasted-image-${Date.now()}.${file.type.split('/')[1]}`;

            // Upload pasted image to storage
            const result = await executeImagePaste({
              fileData,
              fileName,
              fileSize: file.size,
              mimeType: file.type,
            });

            // Auto-inject pasted image into editor
            if (result?.data?.success && result.data.data) {
              const imageUrl = result.data.data.publicUrl;

              // Focus editor and insert image at current cursor position
              editor
                .chain()
                .focus()
                .setImage({
                  src: imageUrl,
                  alt: 'Pasted image',
                  title: `Pasted image: ${fileName}`,
                })
                .run();
            }
            return true; // Prevent default paste behavior
          } catch (error) {
            console.error('Error pasting image:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error({
              description: `Image paste failed: ${errorMessage}`,
            });
            return true; // Still prevent default behavior to avoid duplicate paste
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
        const storagePath = url.pathname.split('/').slice(-3).join('/');

        const result = await executeImageDelete({
          imageUrl,
          storagePath,
        });

        if (result?.data?.success) {
          // Remove the image from the editor
          const { state, dispatch } = editor.view;
          const { doc } = state;

          doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === imageUrl) {
              const transaction = state.tr.delete(pos, pos + node.nodeSize);
              dispatch(transaction);
              return false; // Stop traversing
            }
          });
        }
      } catch (error) {
        console.error('Error deleting image:', error);
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
        const storagePath = url.pathname.split('/').slice(-3).join('/');
        await executeImageDelete({
          imageUrl,
          storagePath,
        });
      } catch (error) {
        console.error('Error cleaning up deleted image:', error);
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
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm my-4 block',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: typeof content === 'string' ? undefined : content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setFormContent(json);

      const currentImages: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'image' && node.attrs.src) {
          currentImages.push(node.attrs.src);
        }
      });

      // Find images that were removed
      const removedImages = previousImages.filter((src) => !currentImages.includes(src));

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
            if (item.type.startsWith('image/')) {
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
        if (node.type.name === 'image' && node.attrs.src) {
          currentImages.push(node.attrs.src);
        }
      });
      setPreviousImages(currentImages);
    }
  }, [editor, previousImages.length]);

  // Event handlers for components
  const onScreenshotClick = useCallback(() => {
    if (!editor) {
      toast.error({
        description: 'Editor is not ready for screenshot capture',
      });
      return;
    }

    if (!videoElement) {
      toast.error({
        description: 'No video available for screenshot capture',
      });
      return;
    }

    handleScreenshot(editor);
  }, [editor, videoElement, handleScreenshot]);

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

  // Debug function to test image insertion
  const testImageInsertion = useCallback(() => {
    if (!editor) {
      console.error('❌ Editor not available for test');
      return;
    }

    console.log('🧪 Testing image insertion...');

    // Test with a simple placeholder image
    const testImageUrl = 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Screenshot';

    try {
      const result = editor
        .chain()
        .focus()
        .setImage({
          src: testImageUrl,
          alt: 'Test screenshot',
          title: 'Test screenshot for debugging',
        })
        .run();

      console.log('🧪 Test insertion result:', result);
      console.log('🧪 Editor HTML after test:', editor.getHTML());

      const hasTestImage = editor.getHTML().includes(testImageUrl);
      console.log('🧪 Test image found in editor:', hasTestImage);

      if (hasTestImage) {
        toast.success({ description: 'Test image inserted successfully!' });
      } else {
        toast.error({ description: 'Test image insertion failed' });
      }
    } catch (error) {
      console.error('🧪 Test insertion error:', error);
      toast.error({ description: 'Test image insertion error' });
    }
  }, [editor]);

  // Expose test function in development
  if (typeof window !== 'undefined') {
    (window as any).testImageInsertion = testImageInsertion;
  }

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
