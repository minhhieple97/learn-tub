"use client";

import React, { useState, useCallback } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteImageAction } from "@/features/notes/actions/media-actions";
import { toast } from "@/hooks/use-toast";

type IImageWithDeleteProps = {
  node: any;
  deleteNode: () => void;
  disabled: boolean;
};

export const ImageWithDelete = ({
  node,
  deleteNode,
  disabled,
}: IImageWithDeleteProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!node?.attrs?.src) {
    return null;
  }
  const { execute: executeDelete, isExecuting } = useAction(deleteImageAction, {
    onSuccess: () => {
      deleteNode();
    },
    onError: () => {
      toast.error({
        description: 'Failed to delete image. Please try again.',
      });
    },
  });

  const handleDelete = useCallback(async () => {
    if (disabled || isExecuting) return;

    const imageUrl = node.attrs.src;

    if (imageUrl.startsWith('blob:')) {
      deleteNode();
      return;
    }

    try {
      const url = new URL(imageUrl);
      const storagePath = url.pathname.split('/').slice(-3).join('/');

      executeDelete({
        imageUrl,
        storagePath,
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error({
        description: 'Failed to delete image. Please try again.',
      });
    }
  }, [node.attrs.src, disabled, isExecuting, executeDelete, deleteNode]);

  return (
    <NodeViewWrapper className="relative inline-block">
      <div
        className="relative inline-block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs?.alt || ''}
          title={node.attrs?.title || ''}
          className="max-w-full h-auto rounded-lg shadow-sm my-4 block"
          draggable={false}
        />

        {(isHovered || isExecuting) && (
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-start justify-end p-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={disabled || isExecuting}
              className="h-8 w-8 p-0 opacity-90 hover:opacity-100"
              title="Delete image"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {node.attrs.src.startsWith('blob:') && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
            Uploading...
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
