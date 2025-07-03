"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "@/features/notes/constants";
import { useRichTextEditor } from "@/features/notes/hooks/use-rich-text-editor";

export const StatusBar = () => {
  const { isUploadingImage, isDeletingImage } = useRichTextEditor();
  const isLoading = isUploadingImage || isDeletingImage;

  const getLoadingText = () => {
    if (isUploadingImage) return 'Uploading...';
    if (isDeletingImage) return 'Deleting...';
    return '';
  };

  return (
    <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/50 border-t">
      <div className="flex items-center justify-between">
        <span>
          Press {KEYBOARD_SHORTCUTS.PASTE_IMAGE} to paste images •{" "}
          {KEYBOARD_SHORTCUTS.SCREENSHOT} for screenshot • Hover over images to
          delete
        </span>
        {isLoading && (
          <span className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {getLoadingText()}
          </span>
        )}
      </div>
    </div>
  );
};
