"use client";

import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { useNotesStore } from "../store";
import { useNotesSearch as useNotesSearchQuery } from "./use-notes-queries";
import { SEARCH_CONFIG } from "@/config/constants";

export const useNotesSearch = () => {
  const { searchQuery, setSearchQuery, clearSearch, currentVideo } =
    useNotesStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY),
    [],
  );

  const { data: searchResults, isLoading: isSearching } = useNotesSearchQuery(
    currentVideo?.id,
    debouncedSearchQuery,
  );

  const isSearchActive = Boolean(debouncedSearchQuery.trim());
  const resultCount = searchResults?.length || 0;

  useEffect(() => {
    debouncedSetSearch(inputValue);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [inputValue, debouncedSetSearch]);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.slice(0, SEARCH_CONFIG.MAX_QUERY_LENGTH);
    setInputValue(trimmedValue);
  };

  const handleClearSearch = () => {
    setInputValue("");
    setDebouncedSearchQuery("");
    debouncedSetSearch.cancel();
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
