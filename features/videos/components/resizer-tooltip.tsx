type ResizerTooltipProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const ResizerTooltip = ({ isDragging, isKeyboardActive }: ResizerTooltipProps) => {
  return (
    <div
      className={`
      absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 
      transition-all duration-300 ease-out pointer-events-none z-20 transform
      ${
        isDragging || isKeyboardActive
          ? 'opacity-100 -translate-y-1 scale-105'
          : 'translate-y-0 scale-100'
      }
    `}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />

        <div className="relative bg-primary/95 border-2 border-primary rounded-lg px-1 text-sm font-medium shadow-xl backdrop-blur-sm">
          <div className="text-center text-background  font-semibold">
            {isDragging ? '🔄 Resizing panels...' : '↔️ Drag to resize'}
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};
