type GripDotsProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const GripDots = ({ isDragging, isKeyboardActive }: GripDotsProps) => {
  const getDotClass = (index: number) => {
    const baseClass = `w-1.5 h-1.5 rounded-full transition-all duration-200 ease-out will-change-[background-color,transform]`;
    const colorClass =
      isDragging || isKeyboardActive
        ? "bg-primary shadow-sm shadow-primary/50"
        : "bg-muted-foreground/70 group-hover:bg-primary/80 group-hover:shadow-sm group-hover:shadow-primary/30";
    const animationClass =
      isDragging || isKeyboardActive
        ? `animate-pulse`
        : "group-hover:scale-110";
    const delayClass = `animation-delay-${index * 100}`;

    return `${baseClass} ${colorClass} ${animationClass} ${delayClass}`;
  };

  const getRowClass = (rowIndex: number) => {
    const baseClass = `flex space-x-1 transition-all duration-200 ease-out`;
    const opacityClass =
      isDragging || isKeyboardActive
        ? "opacity-100"
        : "opacity-70 group-hover:opacity-100";
    const transformClass =
      isDragging || isKeyboardActive ? "scale-105" : "group-hover:scale-105";
    const delayClass = `transition-delay-${rowIndex * 50}`;

    return `${baseClass} ${opacityClass} ${transformClass} ${delayClass}`;
  };

  return (
    <div className="flex flex-col space-y-1.5 p-0.5">
      <div className={getRowClass(0)}>
        <div className={getDotClass(0)} />
        <div className={getDotClass(1)} />
      </div>
      <div className={getRowClass(1)}>
        <div className={getDotClass(2)} />
        <div className={getDotClass(3)} />
      </div>
      <div className={getRowClass(2)}>
        <div className={getDotClass(4)} />
        <div className={getDotClass(5)} />
      </div>
      <div className={getRowClass(3)}>
        <div className={getDotClass(6)} />
        <div className={getDotClass(7)} />
      </div>
    </div>
  );
};
