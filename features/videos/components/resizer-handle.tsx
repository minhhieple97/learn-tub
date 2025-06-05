import { GripDots } from './grip-dots';

type ResizerHandleProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const ResizerHandle = ({ isDragging, isKeyboardActive }: ResizerHandleProps) => {
  return (
    <div
      className={`
      absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out
      ${
        isDragging || isKeyboardActive
          ? 'w-5 h-16 bg-primary/15 border-2 border-primary shadow-lg shadow-primary/30 scale-110'
          : 'w-4 h-12 bg-background/90 border-2 border-border group-hover:bg-primary/10 group-hover:border-primary/60 group-hover:scale-105'
      }
      rounded-xl backdrop-blur-sm
    `}
    >
      <div className="flex items-center justify-center h-full">
        <GripDots isDragging={isDragging} isKeyboardActive={isKeyboardActive} />
      </div>
    </div>
  );
};
