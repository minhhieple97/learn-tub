import React from 'react';
import { ResizerHandle } from './resizer-handle';
import { ResizerTooltip } from './resizer-tooltip';

type PanelResizerProps = {
  onMouseDown: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isDragging: boolean;
  isKeyboardActive: boolean;
  leftWidth: number;
  rightWidth: number;
};

export const PanelResizer = ({
  onMouseDown,
  onKeyDown,
  isDragging,
  isKeyboardActive,
}: PanelResizerProps) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`
        group relative shrink-0 transform-gpu cursor-col-resize transition-all duration-200
        ease-out will-change-[width]
        ${isDragging || isKeyboardActive ? 'w-8' : 'w-5 hover:w-6'}
      `}
      style={{ userSelect: 'none' }}
      role="separator"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-border/10 via-border/30 to-border/10" />

      {/* Animated glow effect */}
      <div
        className={`
        pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-primary/20 via-primary/40
        to-primary/20 opacity-0 blur-sm transition-all duration-200 ease-out
        group-hover:opacity-60 ${
          isDragging || isKeyboardActive ? 'scale-110 opacity-100' : ''
        }
      `}
      />

      {/* Interactive highlight */}
      <div
        className={`
        pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/15
        to-transparent opacity-0 transition-all duration-200 ease-out
        group-hover:opacity-100 ${
          isDragging || isKeyboardActive ? 'opacity-100' : ''
        }
      `}
      />

      {/* Subtle border */}
      <div className="absolute inset-0 rounded-lg border border-border/20 group-hover:border-primary/30" />

      <ResizerHandle
        isDragging={isDragging}
        isKeyboardActive={isKeyboardActive}
      />

      <ResizerTooltip
        isDragging={isDragging}
        isKeyboardActive={isKeyboardActive}
      />
    </div>
  );
};
