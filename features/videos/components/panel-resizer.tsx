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
        group relative cursor-col-resize flex-shrink-0 transition-all duration-300 ease-out
        ${isDragging || isKeyboardActive ? 'w-6' : 'w-4 hover:w-5'}
      `}
      style={{ userSelect: 'none' }}
      role="separator"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-border/20 via-border/40 to-border/20 rounded-sm" />

      <ResizerHandle isDragging={isDragging} isKeyboardActive={isKeyboardActive} />

      <ResizerTooltip isDragging={isDragging} isKeyboardActive={isKeyboardActive} />

      <div
        className={`
        absolute inset-0 opacity-0 transition-opacity duration-300 ease-out pointer-events-none
        bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-sm
        group-hover:opacity-100 ${isDragging || isKeyboardActive ? 'opacity-100' : ''}
      `}
      />
    </div>
  );
};
