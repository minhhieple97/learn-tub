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
  VALIDATION_LIMITS,
  TOAST_MESSAGES as GLOBAL_TOAST_MESSAGES,
} from "@/config/constants";
import {
  captureAndSaveScreenshotAction,
  uploadScreenshotAction,
  handleImagePasteAction,
  deleteImageAction,
} from "@/features/notes/actions/media-actions";
import { useNotesStore } from "../store";
import { useInvalidateNotes } from "./use-notes-queries";
import { ImageWithDelete } from "../components/rich-text-editor/image-with-delete";

type IValidationResult = {
  isValid: boolean;
  errors: string[];
};

type IUseRichTextEditorReturn = {
  // Rich text editor properties
  editor: Editor | null;
  isUploadingImage: boolean;
  isDeletingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
  disabled: boolean;
  isLoading: boolean;

  // Form state properties
  formContent: any;
  formTags: string[];
  tagInput: string;
  editingNote: any;
  isFormLoading: boolean;
  currentTimestamp: number;
  isEditing: boolean;
  isSaveDisabled: boolean;

  // Form handlers
  handleTagInputChange: (input: string) => void;
  handleAddTag: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSave: () => Promise<void>;
  removeTag: (tag: string) => void;
  cancelEditing: () => void;

  // Validation methods
  isFormValid: () => boolean;
  validateTagInput: (tagInput: string) => boolean;
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

    // Override the parseHTML to ensure attrs are preserved
    parseHTML() {
      return [
        {
          tag: "img[src]",
          getAttrs: (element) => {
            const img = element as HTMLImageElement;
            const src = img.getAttribute("src");

            // Validate that we have a proper src attribute
            if (!src || src.trim() === "") {
              return false; // Don't parse images without valid src
            }

            return {
              src: src,
              alt: img.getAttribute("alt") || "",
              title: img.getAttribute("title") || "",
              width: img.getAttribute("width"),
              height: img.getAttribute("height"),
            };
          },
        },
      ];
    },

    // Ensure proper rendering to HTML with all attributes
    renderHTML({ HTMLAttributes }) {
      // Ensure src attribute is present before rendering
      if (!HTMLAttributes.src || HTMLAttributes.src.trim() === "") {
        return ["div", { class: "image-placeholder" }, "Invalid image"];
      }
      return ["img", HTMLAttributes];
    },

    // Add custom validation for the src attribute
    addProseMirrorPlugins() {
      return [...(this.parent?.() || [])];
    },

    // Ensure proper serialization and JSON handling
    addStorage() {
      return {
        ...this.parent?.(),
        // Ensure proper JSON serialization
        toJSON: (node: any) => {
          const attrs = node.attrs || {};

          // Don't serialize images without valid src
          if (!attrs.src || attrs.src.trim() === "") {
            return null;
          }

          return {
            type: "image",
            attrs: {
              src: attrs.src,
              alt: attrs.alt || "",
              title: attrs.title || "",
              width: attrs.width,
              height: attrs.height,
            },
          };
        },
      };
    },
  });
};

export const useRichTextEditor = (): IUseRichTextEditorReturn => {
  const {
    formContent,
    formTags,
    tagInput,
    editingNote,
    isFormLoading,
    currentTimestamp,
    currentVideo,
    setFormContent,
    setTagInput,
    addTag,
    removeTag,
    cancelEditing,
    saveNote,
    updateNote,
  } = useNotesStore();

  const { invalidateByVideo, invalidateSearch } = useInvalidateNotes();

  const disabled = isFormLoading;
  const placeholder = "Write your notes here...";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previousImages, setPreviousImages] = useState<string[]>([]);
  const uploadingImages = useRef<Map<string, string>>(new Map());

  const { executeAsync: executeImageUpload } = useAction(
    uploadScreenshotAction,
  );
  const { executeAsync: executeImagePaste } = useAction(handleImagePasteAction);
  const { executeAsync: executeImageDelete } = useAction(deleteImageAction);

  // Form validation methods
  const validateTags = useCallback((tags: string[]): IValidationResult => {
    const errors: string[] = [];

    if (tags.length > VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      errors.push(GLOBAL_TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS);
    }

    const invalidTags = tags.filter(
      (tag) => tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH,
    );
    if (invalidTags.length > 0) {
      errors.push(GLOBAL_TOAST_MESSAGES.VALIDATION_TAG_TOO_LONG);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const validateTagInput = useCallback((tagInput: string): boolean => {
    return tagInput.length <= VALIDATION_LIMITS.TAG_MAX_LENGTH;
  }, []);

  const showValidationErrors = useCallback((errors: string[]) => {
    errors.forEach((error) => {
      toast.error({
        title: "Validation Error",
        description: error,
      });
    });
  }, []);

  const hasValidContent = useCallback(() => {
    if (!formContent || typeof formContent !== "object") return false;

    const isEmpty =
      formContent.type === "doc" &&
      Array.isArray(formContent.content) &&
      formContent.content.length === 0;

    if (isEmpty) return false;

    const hasText = JSON.stringify(formContent).includes('"text"');
    return hasText;
  }, [formContent]);

  const isFormValid = useCallback(() => {
    const tagsValidation = validateTags(formTags);
    const hasContent = hasValidContent();
    return tagsValidation.isValid && hasContent;
  }, [formTags, validateTags, hasValidContent]);

  // Form handlers
  const handleTagInputChange = useCallback(
    (input: string) => {
      if (validateTagInput(input)) {
        setTagInput(input);
      }
    },
    [setTagInput, validateTagInput],
  );

  const handleAddTag = useCallback(() => {
    if (!tagInput.trim()) return;
    if (formTags.length >= VALIDATION_LIMITS.MAX_TAGS_COUNT) {
      showValidationErrors([GLOBAL_TOAST_MESSAGES.VALIDATION_TOO_MANY_TAGS]);
      return;
    }

    if (tagInput.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
      showValidationErrors([GLOBAL_TOAST_MESSAGES.VALIDATION_TAG_TOO_LONG]);
      return;
    }
    addTag();
  }, [tagInput, formTags.length, addTag, showValidationErrors]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  const handleSave = useCallback(async () => {
    const tagsValidation = validateTags(formTags);
    if (!tagsValidation.isValid) {
      showValidationErrors(tagsValidation.errors);
      return;
    }
    console.log("formContent", formContent);
    try {
      if (editingNote) {
        // await updateNote(editingNote.id, formContent, formTags);
      } else {
        await saveNote(formContent, formTags, currentTimestamp);
      }

      // Invalidate queries to refetch data
      if (currentVideo) {
        invalidateByVideo(currentVideo.id);
        invalidateSearch(currentVideo.id);
      }
    } catch (error) {
      // Error handling is done in the store methods
      console.error("Error in handleSave:", error);
    }
  }, [
    formContent,
    formTags,
    editingNote,
    currentTimestamp,
    currentVideo,
    validateTags,
    showValidationErrors,
    updateNote,
    saveNote,
    invalidateByVideo,
    invalidateSearch,
  ]);

  // Image handling methods
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

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, editor: Editor) => {
      const file = event.target.files?.[0];

      if (!file || !editor || disabled) return;

      if (!validateImageFile(file)) {
        resetFileInput();
        return;
      }

      const blobUrl = URL.createObjectURL(file);
      uploadingImages.current.set(blobUrl, file.name);

      // Use a more explicit insertion method to ensure proper cursor placement
      const { state } = editor.view;
      const { selection } = state;

      // Insert image node at current cursor position
      const imageNodeType = editor.schema.nodes.image;
      if (!imageNodeType) {
        throw new Error("Image node type not found in editor schema");
      }

      const imageNode = imageNodeType.create({
        src: blobUrl,
        alt: file.name,
        title: `Uploading: ${file.name}`,
      });

      const transaction = state.tr.insert(selection.from, imageNode);
      editor.view.dispatch(transaction);

      setIsUploadingImage(true);

      try {
        const fileData = await convertFileToBase64(file);

        const result = await executeImageUpload({
          fileData,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        console.log("result", result);
        if (result?.data?.success && result.data?.data) {
          const imageUrl = result.data.data.publicUrl;
          console.log("imageUrl", imageUrl);
          if (!imageUrl || imageUrl.trim() === "") {
            throw new Error("Received empty image URL from server");
          }

          // Update the blob URL to the real URL in the editor
          const { state, dispatch } = editor.view;
          const { doc } = state;
          let transaction = state.tr;
          let imageFound = false;

          doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.src === blobUrl) {
              console.log("node", node);
              transaction = transaction.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                src: imageUrl,
                alt: file.name,
                title: file.name,
              });
              imageFound = true;
              return false;
            }
          });

          if (imageFound) {
            dispatch(transaction);
            uploadingImages.current.delete(blobUrl);
            URL.revokeObjectURL(blobUrl);
            console.log("Successfully uploaded image:", imageUrl);
          } else {
            console.warn(
              "Could not find uploaded image in editor content, but upload succeeded",
            );
            uploadingImages.current.delete(blobUrl);
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          throw new Error(
            "Failed to upload image - no valid response received",
          );
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        // Remove the failed image upload from editor
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

          const blobUrl = URL.createObjectURL(file);
          const fileName = `pasted-image-${Date.now()}.${file.type.split("/")[1]}`;

          try {
            uploadingImages.current.set(blobUrl, fileName);

            // Use explicit insertion method for pasted images
            const { state } = editor.view;
            const { selection } = state;

            // Insert image node at current cursor position
            const imageNodeType = editor.schema.nodes.image;
            if (!imageNodeType) {
              throw new Error("Image node type not found in editor schema");
            }

            const imageNode = imageNodeType.create({
              src: blobUrl,
              alt: "Pasted image",
              title: `Uploading: ${fileName}`,
            });

            const transaction = state.tr.insert(selection.from, imageNode);
            editor.view.dispatch(transaction);

            const fileData = await convertFileToBase64(file);

            const result = await executeImagePaste({
              fileData,
              fileName,
              fileSize: file.size,
              mimeType: file.type,
            });

            if (result?.data?.success && result.data.data) {
              const imageUrl = result.data.data.publicUrl;

              if (!imageUrl || imageUrl.trim() === "") {
                throw new Error("Received empty image URL from server");
              }

              // Update the blob URL to the real URL in the editor
              const { state, dispatch } = editor.view;
              const { doc } = state;
              let transaction = state.tr;
              let imageFound = false;

              doc.descendants((node, pos) => {
                if (node.type.name === "image" && node.attrs.src === blobUrl) {
                  transaction = transaction.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    src: imageUrl,
                    alt: "Pasted image",
                    title: fileName,
                  });
                  imageFound = true;
                  return false;
                }
              });

              if (imageFound) {
                dispatch(transaction);
                uploadingImages.current.delete(blobUrl);
                URL.revokeObjectURL(blobUrl);
                console.log("Successfully pasted image:", imageUrl);
              } else {
                console.warn(
                  "Could not find pasted image in editor content, but upload succeeded",
                );
                uploadingImages.current.delete(blobUrl);
                URL.revokeObjectURL(blobUrl);
              }
            } else {
              throw new Error(
                "Failed to upload pasted image - no valid response received",
              );
            }

            return true;
          } catch (error) {
            console.error("Error pasting image:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";

            // Remove the failed image paste from editor
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
    [disabled, convertFileToBase64, executeImagePaste],
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
      // Get HTML and convert back to JSON to ensure proper serialization
      const html = editor.getHTML();
      const json = editor.getJSON();

      // Fix image nodes by extracting attrs from the actual DOM if needed
      const fixImageNodes = (content: any): any => {
        if (Array.isArray(content)) {
          return content.map(fixImageNodes).filter((item) => {
            // Only filter out image nodes that have no src at all
            if (item && typeof item === "object" && item.type === "image") {
              // If attrs is a function or missing, try to reconstruct from editor state
              if (
                typeof item.attrs === "function" ||
                !item.attrs ||
                !item.attrs.src
              ) {
                return false; // Remove invalid image nodes
              }
              return item.attrs && item.attrs.src; // Keep images with valid src
            }
            return true;
          });
        } else if (content && typeof content === "object") {
          if (content.type === "image") {
            // Ensure image node has proper attrs
            if (typeof content.attrs === "function" || !content.attrs) {
              return null; // Remove invalid image node
            }
            return content;
          }
          if (content.content) {
            const fixedContent = fixImageNodes(content.content);
            return {
              ...content,
              content: fixedContent,
            };
          }
          return content;
        }
        return content;
      };

      // Process the JSON to fix any image node issues
      let processedJson = { ...json };
      if (processedJson.content) {
        processedJson.content = fixImageNodes(processedJson.content);
      }

      // Double-check by manually extracting image data from editor state
      const imageNodes: any[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs) {
          imageNodes.push({
            pos,
            attrs: { ...node.attrs }, // Create a plain object copy
          });
        }
      });

      // Ensure image nodes in JSON have correct attrs
      if (processedJson.content && Array.isArray(processedJson.content)) {
        let imageIndex = 0;
        processedJson.content = processedJson.content.map((item: any) => {
          if (item && item.type === "image") {
            if (imageIndex < imageNodes.length) {
              return {
                type: "image",
                attrs: imageNodes[imageIndex++].attrs,
              };
            }
          }
          return item;
        });
      }

      // Check if content actually changed to avoid unnecessary updates
      const currentContent = JSON.stringify(formContent);
      const newContent = JSON.stringify(processedJson);

      if (currentContent !== newContent) {
        console.log("Saving content with fixed images:", processedJson);
        setFormContent(processedJson);
      }

      // Track valid images for cleanup (only real URLs, not blob URLs)
      const currentImages: string[] = [];
      editor.state.doc.descendants((node) => {
        if (
          node.type.name === "image" &&
          node.attrs?.src &&
          node.attrs.src.trim() !== ""
        ) {
          const isUploadingImage = uploadingImages.current.has(node.attrs.src);
          const isBlobUrl = node.attrs.src.startsWith("blob:");
          // Only track real URLs (not blob URLs or uploading images) for cleanup
          if (!isUploadingImage && !isBlobUrl) {
            currentImages.push(node.attrs.src);
          }
        }
      });

      // Clean up removed images (only from real URLs, not blob URLs)
      const removedImages = previousImages.filter(
        (src) => !currentImages.includes(src) && !src.startsWith("blob:"),
      );

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

  // Computed values
  const isEditing = Boolean(editingNote);
  const isSaveDisabled = isFormLoading || !isFormValid();

  return {
    // Rich text editor properties
    editor,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    onImageUpload,
    triggerImageUpload,
    disabled,
    isLoading: isFormLoading,

    // Form state properties
    formContent,
    formTags,
    tagInput,
    editingNote,
    isFormLoading,
    currentTimestamp,
    isEditing,
    isSaveDisabled,

    // Form handlers
    handleTagInputChange,
    handleAddTag,
    handleKeyDown,
    handleSave,
    removeTag,
    cancelEditing,

    // Validation methods
    isFormValid,
    validateTagInput,
  };
};
