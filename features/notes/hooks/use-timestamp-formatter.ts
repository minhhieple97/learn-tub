'use client';

import { useCallback } from 'react';

export const useTimestampFormatter = () => {
  const formatTimestamp = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  return { formatTimestamp };
};
