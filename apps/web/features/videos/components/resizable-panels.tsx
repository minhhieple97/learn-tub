import { ReactNode } from "react";
import { useResizablePanels } from "../hooks/use-resizable-panels";
import { PanelResizer } from "./panel-resizer";

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
  const {
    leftWidth,
    rightWidth,
    isDragging,
    isKeyboardActive,
    handleMouseDown,
    handleKeyDown,
  } = useResizablePanels({
    initialLeftWidth,
    minLeftWidth,
    maxLeftWidth,
  });

  return (
    <div className="relative flex min-h-0">
      <div
        style={{ width: `${leftWidth}%` }}
        className={`
          shrink-0 pr-3 will-change-[width]
          ${
            isDragging
              ? "transition-none"
              : "transition-[width] duration-300 ease-out"
          }
        `}
      >
        {leftPanel}
      </div>

      <PanelResizer
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        isDragging={isDragging}
        isKeyboardActive={isKeyboardActive}
        leftWidth={leftWidth}
        rightWidth={rightWidth}
      />

      <div
        style={{ width: `${rightWidth}%` }}
        className={`
          shrink-0 pl-3 will-change-[width]
          ${
            isDragging
              ? "transition-none"
              : "transition-[width] duration-300 ease-out"
          }
        `}
      >
        {rightPanel}
      </div>
    </div>
  );
};
