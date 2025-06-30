'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';
import { FormattingButtons } from './formatting-buttons';
import { MediaButtons } from './media-buttons';

type IToolbarProps = {
  editor: Editor;
  onScreenshotClick: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerImageUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isCapturingScreenshot: boolean;
  isUploadingImage: boolean;
  disabled: boolean;
  videoElement?: HTMLVideoElement | null;
};

export const Toolbar = ({
  editor,
  onScreenshotClick,
  onImageUpload,
  triggerImageUpload,
  fileInputRef,
  isCapturingScreenshot,
  isUploadingImage,
  disabled,
  videoElement,
}: IToolbarProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <FormattingButtons editor={editor} disabled={disabled} />

      <Separator orientation="vertical" className="mx-2 h-6" />

      <MediaButtons
        onScreenshotClick={onScreenshotClick}
        onImageUpload={onImageUpload}
        triggerImageUpload={triggerImageUpload}
        fileInputRef={fileInputRef}
        isCapturingScreenshot={isCapturingScreenshot}
        isUploadingImage={isUploadingImage}
        disabled={disabled}
        videoElement={videoElement}
      />
    </div>
  );
};
