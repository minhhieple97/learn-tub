import { GripDots } from './grip-dots';

type ResizerHandleProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const ResizerHandle = ({
  isDragging,
  isKeyboardActive,
}: ResizerHandleProps) => {
  return (
    <div
      className={`
      absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
      transform-gpu
      transition-all duration-200 ease-out will-change-[transform,width,height,border-color,background-color,box-shadow]
      ${
        isDragging || isKeyboardActive
          ? 'h-20 w-6 scale-110 border-2 border-primary/80 bg-gradient-to-b from-primary/25 via-primary/15 to-primary/25 shadow-xl shadow-primary/50'
          : 'h-14 w-5 border-2 border-border/60 bg-gradient-to-b from-background/95 via-background/80 to-background/95 group-hover:scale-105 group-hover:border-primary/70 group-hover:shadow-lg group-hover:shadow-primary/20'
      }
      relative overflow-hidden rounded-2xl backdrop-blur-md
    `}
    >
      {/* Inner glow effect */}
      <div
        className={`
        absolute inset-0 rounded-2xl transition-opacity duration-200
        ${
          isDragging || isKeyboardActive
            ? 'bg-gradient-to-b from-primary/10 to-transparent opacity-100'
            : 'bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100'
        }
      `}
      />

      {/* Highlight strip */}
      <div
        className={`
        absolute inset-y-2 left-1/2 w-px -translate-x-1/2 transition-opacity duration-200
        ${
          isDragging || isKeyboardActive
            ? 'bg-gradient-to-b from-transparent via-primary/60 to-transparent opacity-100'
            : 'bg-gradient-to-b from-transparent via-border/40 to-transparent opacity-0 group-hover:opacity-100'
        }
      `}
      />

      <div className="relative z-10 flex h-full items-center justify-center">
        <GripDots isDragging={isDragging} isKeyboardActive={isKeyboardActive} />
      </div>
    </div>
  );
};
