'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useEditor, Editor, ReactNodeViewRenderer, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { RICH_TEXT_EDITOR } from '@/features/notes/constants';
import { useRichTextEditorActions } from './use-rich-text-editor-actions';
import { useNotesStore } from '../store';

type IUseRichTextEditorSetupProps = {
  content: JSONContent | string;
  placeholder?: string;
  userId: string;
  videoId: string;
  videoTitle?: string;
  noteId?: string;
  videoElement?: HTMLVideoElement | null;
  disabled?: boolean;
  ImageWithDelete: React.ComponentType<{ node: any; deleteNode: () => void; disabled: boolean }>;
};

type IUseRichTextEditorSetupReturn = {
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
  ImageWithDelete: React.ComponentType<{ node: any; deleteNode: () => void; disabled: boolean }>,
) =>
  Image.extend({
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

export const useRichTextEditorSetup = ({
  content,
  placeholder = 'Write your notes here...',
  userId,
  videoId,
  videoTitle,
  noteId,
  videoElement,
  disabled = false,
  ImageWithDelete,
}: IUseRichTextEditorSetupProps): IUseRichTextEditorSetupReturn => {
  const [previousImages, setPreviousImages] = useState<string[]>([]);

  const {
    isCapturingScreenshot,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    handleScreenshot,
    handleImageUpload,
    handleImagePaste,
    handleImageDelete,
    handleManualImageDelete,
    triggerImageUpload,
  } = useRichTextEditorActions({
    userId,
    videoId,
    videoTitle,
    noteId,
    videoElement,
    disabled,
  });

  const CustomImage = useMemo(
    () =>
      createImageExtension(handleImageDelete, handleManualImageDelete, disabled, ImageWithDelete),
    [handleImageDelete, handleManualImageDelete, disabled, ImageWithDelete],
  );
  const { setFormContent } = useNotesStore();
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
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
        class: RICH_TEXT_EDITOR.PROSE_CLASSES,
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

  return {
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
