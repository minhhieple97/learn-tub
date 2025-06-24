'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useNotesStore } from '../store';
import { SEARCH_CONFIG } from '@/config/constants';

export const useNotesSearch = () => {
  const { isSearching, isSearchActive, resultCount, performSearch, clearSearch } = useNotesStore();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, SEARCH_CONFIG.DEBOUNCE_DELAY);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery.trim());
      return;
    }
    clearSearch();
  }, [debouncedSearchQuery, performSearch, clearSearch]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.slice(0, SEARCH_CONFIG.MAX_QUERY_LENGTH);
    setInputValue(trimmedValue);
  };

  const handleClearSearch = () => {
    setInputValue('');
    clearSearch();
  };

  return {
    inputValue,
    isSearching,
    isSearchActive,
    resultCount,
    handleInputChange,
    handleClearSearch,
  };
}; 