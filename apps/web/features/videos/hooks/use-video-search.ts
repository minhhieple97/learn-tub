"use client";

import { IUseVideoSearchReturn } from "@/features/videos/types";
import { useQueryState } from "nuqs";
import { useEffect, useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

const DEBOUNCE_TIME = 500;

export const useVideoSearch = (): IUseVideoSearchReturn => {
  const router = useRouter();
  const [urlSearchQuery, setUrlSearchQuery] = useQueryState("q");
  const [displayValue, setDisplayValue] = useState(urlSearchQuery || "");

  const debouncedUpdateUrl = useMemo(
    () =>
      debounce(async (value: string) => {
        const trimmedValue = value.trim();
        await setUrlSearchQuery(trimmedValue || null);
        router.refresh();
      }, DEBOUNCE_TIME),
    [setUrlSearchQuery, router],
  );

  useEffect(() => {
    return () => {
      debouncedUpdateUrl.cancel();
    };
  }, [debouncedUpdateUrl]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setDisplayValue(value);
      debouncedUpdateUrl(value);
    },
    [debouncedUpdateUrl],
  );

  const handleClearSearch = useCallback(() => {
    setDisplayValue("");
    debouncedUpdateUrl.cancel();
    setUrlSearchQuery(null);
    router.refresh();
  }, [debouncedUpdateUrl, setUrlSearchQuery, router]);

  useEffect(() => {
    setDisplayValue(urlSearchQuery || "");
  }, [urlSearchQuery]);

  const returnValue = useMemo(
    () => ({
      searchQuery: displayValue,
      setSearchQuery: handleSearchChange,
      clearSearch: handleClearSearch,
      isSearching: displayValue !== (urlSearchQuery || ""),
    }),
    [displayValue, handleSearchChange, handleClearSearch, urlSearchQuery],
  );

  return returnValue;
};
