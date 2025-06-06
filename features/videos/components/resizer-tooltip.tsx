type ResizerTooltipProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const ResizerTooltip = ({
  isDragging,
  isKeyboardActive,
}: ResizerTooltipProps) => {
  return (
    <div
      className={`
      pointer-events-none absolute -top-16 left-1/2 z-30 -translate-x-1/2 transform-gpu 
      opacity-0 transition-all
      duration-200 ease-out will-change-[transform,opacity] group-hover:opacity-100 group-focus:opacity-100
      ${
        isDragging || isKeyboardActive
          ? '-translate-y-2 scale-105 opacity-100'
          : 'translate-y-1 scale-95'
      }
    `}
    >
      <div className="relative">
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm will-change-auto" />

        <div className="relative rounded-lg border border-primary/60 bg-primary/90 px-2 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm will-change-auto">
          <div className="flex items-center gap-1.5 text-center text-background">
            <span className="text-sm">{isDragging ? '🔄' : '↔️'}</span>
            <span className="font-semibold">
              {isDragging ? 'Resizing...' : 'Resize'}
            </span>
            {!isDragging && <span className="text-background/70">← →</span>}
          </div>

          {/* Arrow pointer */}
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="size-0 border-x-4 border-t-4 border-x-transparent border-t-primary/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
