"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  RICH_TEXT_EDITOR,
  KEYBOARD_SHORTCUTS,
} from "@/features/notes/constants";

type MediaButtonsProps = {
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploadingImage: boolean;
  disabled: boolean;
};

export const MediaButtons = ({
  onImageUpload,
  triggerImageUpload,
  fileInputRef,
  isUploadingImage,
  disabled,
}: MediaButtonsProps) => {
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
