import { ReactNode } from 'react';
import { useResizablePanels } from '../hooks/use-resizable-panels';
import { PanelResizer } from './panel-resizer';

type ResizablePanelsProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
};

export const ResizablePanels = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 66.666667,
  minLeftWidth = 30,
  maxLeftWidth = 80,
}: ResizablePanelsProps) => {
  const { leftWidth, rightWidth, isDragging, isKeyboardActive, handleMouseDown, handleKeyDown } =
    useResizablePanels({
      initialLeftWidth,
      minLeftWidth,
      maxLeftWidth,
    });

  return (
    <div className="flex min-h-0 relative">
      {/* Left Panel */}
      <div
        style={{ width: `${leftWidth}%` }}
        className={`
          flex-shrink-0 pr-3 transition-all duration-75 ease-out
          ${isDragging ? '' : 'transition-all duration-200 ease-out'}
        `}
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <PanelResizer
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        isDragging={isDragging}
        isKeyboardActive={isKeyboardActive}
        leftWidth={leftWidth}
        rightWidth={rightWidth}
      />

      {/* Right Panel */}
      <div
        style={{ width: `${rightWidth}%` }}
        className={`
          flex-shrink-0 pl-3 transition-all duration-75 ease-out
          ${isDragging ? '' : 'transition-all duration-200 ease-out'}
        `}
      >
        {rightPanel}
      </div>
    </div>
  );
};
