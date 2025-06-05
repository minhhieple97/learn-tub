import { useState, useCallback, useRef, useEffect } from 'react';

type UseResizablePanelsProps = {
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
};

type UseResizablePanelsReturn = {
  leftWidth: number;
  rightWidth: number;
  isDragging: boolean;
  isKeyboardActive: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  resizerRef: React.RefObject<HTMLDivElement | null>;
};

export const useResizablePanels = ({
  initialLeftWidth = 66.666667,
  minLeftWidth = 30,
  maxLeftWidth = 80,
}: UseResizablePanelsProps = {}): UseResizablePanelsReturn => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const rightWidth = 100 - leftWidth;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        const percentage = (mouseX / containerWidth) * 100;

        const clampedPercentage = Math.max(minLeftWidth, Math.min(maxLeftWidth, percentage));

        setLeftWidth(clampedPercentage);
      });
    },
    [isDragging, minLeftWidth, maxLeftWidth],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const container = e.currentTarget.parentElement as HTMLDivElement | null;
    if (container) {
      containerRef.current = container;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const smallStep = 2;
      const largeStep = 10; // 10% for larger jumps
      const step = e.shiftKey ? largeStep : smallStep;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newWidth = Math.max(minLeftWidth, leftWidth - step);
        setLeftWidth(newWidth);
        setTimeout(() => setIsKeyboardActive(false), 150);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsKeyboardActive(true);
        const newWidth = Math.min(maxLeftWidth, leftWidth + step);
        setLeftWidth(newWidth);
        setTimeout(() => setIsKeyboardActive(false), 150);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setLeftWidth(minLeftWidth);
        setTimeout(() => setIsKeyboardActive(false), 300);
      } else if (e.key === 'End') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setLeftWidth(maxLeftWidth);
        setTimeout(() => setIsKeyboardActive(false), 300);
      } else if (e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setIsKeyboardActive(true);
        setLeftWidth(66.666667);
        setTimeout(() => setIsKeyboardActive(false), 300);
      }
    },
    [leftWidth, minLeftWidth, maxLeftWidth],
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    leftWidth,
    rightWidth,
    isDragging,
    isKeyboardActive,
    handleMouseDown,
    handleKeyDown,
    resizerRef,
  };
};
