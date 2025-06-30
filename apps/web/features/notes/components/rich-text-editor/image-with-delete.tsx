'use client';

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { X } from 'lucide-react';
import { RICH_TEXT_EDITOR } from '@/features/notes/constants';

type ImageWithDeleteProps = {
  node: any;
  deleteNode: () => void;
  disabled: boolean;
};

export const ImageWithDelete = ({ node, deleteNode, disabled }: ImageWithDeleteProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <NodeViewWrapper className="relative inline-block">
      <div
        className="relative inline-block"
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className={RICH_TEXT_EDITOR.IMAGE_CLASSES}
        />
        {isHovered && !disabled && (
          <button
            onClick={deleteNode}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
            title="Delete image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
};
