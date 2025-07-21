import { IUseVideoSearchReturn } from "@/features/videos/types";
import { useQueryState } from "nuqs";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
const DEBOUNCE_TIME = 500;
export const useVideoSearch = (): IUseVideoSearchReturn => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useQueryState("q");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchQuery = useCallback(
    debounce(async (value: string) => {
      await setSearchQuery(value || null);
      router.refresh();
    }, DEBOUNCE_TIME),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearchQuery(value);
      debouncedSetSearchQuery(value);
    },
    [debouncedSetSearchQuery],
  );

  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);

  return {
    searchQuery: localSearchQuery,
    setSearchQuery: handleSearch,
  };
};
