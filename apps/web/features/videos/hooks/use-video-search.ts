'use client';

import { IUseVideoSearchReturn } from '@/features/videos/types';
import { useQueryState } from 'nuqs';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

const DEBOUNCE_TIME = 500;

export const useVideoSearch = (): IUseVideoSearchReturn => {
  const router = useRouter();
  const [urlSearchQuery, setUrlSearchQuery] = useQueryState('q');
  const [displayValue, setDisplayValue] = useState(urlSearchQuery || '');

  const debouncedUpdateUrl = useCallback(
    debounce(async (value: string) => {
      const trimmedValue = value.trim();
      await setUrlSearchQuery(trimmedValue || null);
      router.refresh();
    }, DEBOUNCE_TIME),
    [setUrlSearchQuery, router],
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateUrl.cancel();
    };
  }, [debouncedUpdateUrl]);

  // Handle immediate display update and debounced URL update
  const handleSearchChange = useCallback(
    (value: string) => {
      // Update display immediately for instant feedback
      setDisplayValue(value);
      // Update URL with debounce
      debouncedUpdateUrl(value);
    },
    [debouncedUpdateUrl],
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setDisplayValue('');
    debouncedUpdateUrl.cancel();
    setUrlSearchQuery(null);
    router.refresh();
  }, [debouncedUpdateUrl, setUrlSearchQuery, router]);

  // Sync display value with URL when URL changes externally
  useEffect(() => {
    setDisplayValue(urlSearchQuery || '');
  }, [urlSearchQuery]);

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(
    () => ({
      searchQuery: displayValue,
      setSearchQuery: handleSearchChange,
      clearSearch: handleClearSearch,
      isSearching: displayValue !== (urlSearchQuery || ''),
    }),
    [displayValue, handleSearchChange, handleClearSearch, urlSearchQuery],
  );

  return returnValue;
};
