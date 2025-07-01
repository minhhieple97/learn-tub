"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useNotesStore } from "../store";
import { useNotesSearch as useNotesSearchQuery } from "./use-notes-queries";
import { SEARCH_CONFIG } from "@/config/constants";

export const useNotesSearch = () => {
  const { searchQuery, setSearchQuery, clearSearch, currentVideoId } =
    useNotesStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(
    inputValue,
    SEARCH_CONFIG.DEBOUNCE_DELAY,
  );

  // Use react-query search hook
  const { data: searchResults, isLoading: isSearching } = useNotesSearchQuery(
    currentVideoId || "",
    debouncedSearchQuery,
  );

  const isSearchActive = Boolean(debouncedSearchQuery.trim());
  const resultCount = searchResults?.length || 0;

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.slice(0, SEARCH_CONFIG.MAX_QUERY_LENGTH);
    setInputValue(trimmedValue);
  };

  const handleClearSearch = () => {
    setInputValue("");
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
