"use client";

import React from "react";
import { EditorContent } from "@tiptap/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IRichTextEditorProps } from "@/features/notes/types";
import { useRichTextEditorSetup } from "@/features/notes/hooks";
import { RICH_TEXT_EDITOR } from "@/features/notes/constants";
import {
  ImageWithDelete,
  Toolbar,
  StatusBar,
  LoadingState,
} from "./rich-text-editor/index";

export const RichTextEditor = ({
  content,
  placeholder = "Write your notes here...",
  videoElement,
  videoId,
  videoTitle,
  noteId,
  disabled = false,
}: IRichTextEditorProps) => {
  const {
    editor,
    isCapturingScreenshot,
    isUploadingImage,
    isDeletingImage,
    fileInputRef,
    onScreenshotClick,
    onImageUpload,
    triggerImageUpload,
  } = useRichTextEditorSetup({
    content,
    placeholder,
    videoId,
    videoTitle,
    noteId,
    videoElement,
    disabled,
    ImageWithDelete,
  });
  if (!editor) {
    return <LoadingState />;
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <Toolbar
          editor={editor}
          onScreenshotClick={onScreenshotClick}
          onImageUpload={onImageUpload}
          triggerImageUpload={triggerImageUpload}
          fileInputRef={fileInputRef}
          isCapturingScreenshot={isCapturingScreenshot}
          isUploadingImage={isUploadingImage}
          disabled={disabled}
          videoElement={videoElement}
        />
      </CardHeader>

      <CardContent className="p-0">
        <EditorContent
          editor={editor}
          className={`min-h-[${RICH_TEXT_EDITOR.MIN_HEIGHT}px] border-t`}
        />

        <StatusBar
          isCapturingScreenshot={isCapturingScreenshot}
          isUploadingImage={isUploadingImage}
          isDeletingImage={isDeletingImage}
        />
      </CardContent>
    </Card>
  );
};
