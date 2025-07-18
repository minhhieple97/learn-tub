"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { RICH_TEXT_EDITOR } from "@/features/notes/constants";
import { useRichTextEditor } from "../../hooks";

export const MediaButtons = () => {
  const {
    fileInputRef,
    isUploadingImage,
    disabled,
    triggerImageUpload,
    onImageUpload,
  } = useRichTextEditor();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={triggerImageUpload}
        disabled={disabled || isUploadingImage}
        className="h-8 px-3"
        title="Upload image file"
      >
        {isUploadingImage ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <ImageIcon className="h-4 w-4 mr-1" />
        )}
        Image
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept={RICH_TEXT_EDITOR.ACCEPTED_IMAGE_TYPES}
        onChange={onImageUpload}
        className="hidden"
      />
    </>
  );
};
