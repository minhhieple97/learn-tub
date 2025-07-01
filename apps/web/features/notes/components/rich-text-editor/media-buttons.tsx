"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  RICH_TEXT_EDITOR,
  KEYBOARD_SHORTCUTS,
} from "@/features/notes/constants";

type IMediaButtonsProps = {
  onScreenshotClick: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isCapturingScreenshot: boolean;
  isUploadingImage: boolean;
  disabled: boolean;
  videoElement?: HTMLVideoElement | null;
};

export const MediaButtons = ({
  onScreenshotClick,
  onImageUpload,
  triggerImageUpload,
  fileInputRef,
  isCapturingScreenshot,
  isUploadingImage,
  disabled,
  videoElement,
}: IMediaButtonsProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={onScreenshotClick}
        disabled={disabled || isCapturingScreenshot || !videoElement}
        className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border-red-200"
        title={`Capture screenshot from video (${KEYBOARD_SHORTCUTS.SCREENSHOT})`}
      >
        {isCapturingScreenshot ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Camera className="h-4 w-4 mr-1" />
        )}
        Screenshot
      </Button>

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
