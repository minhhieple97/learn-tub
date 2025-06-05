type GripDotsProps = {
  isDragging: boolean;
  isKeyboardActive: boolean;
};

export const GripDots = ({ isDragging, isKeyboardActive }: GripDotsProps) => {
  const getDotClass = () => {
    return `w-1 h-1 rounded-full ${
      isDragging || isKeyboardActive ? 'bg-primary' : 'bg-muted-foreground group-hover:bg-primary'
    }`;
  };

  const getRowClass = () => {
    return `flex space-x-0.5 transition-colors duration-200 ${
      isDragging || isKeyboardActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
    }`;
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className={getRowClass()}>
        <div className={getDotClass()} />
        <div className={getDotClass()} />
      </div>
      <div className={getRowClass()}>
        <div className={getDotClass()} />
        <div className={getDotClass()} />
      </div>
      <div className={getRowClass()}>
        <div className={getDotClass()} />
        <div className={getDotClass()} />
      </div>
    </div>
  );
};
