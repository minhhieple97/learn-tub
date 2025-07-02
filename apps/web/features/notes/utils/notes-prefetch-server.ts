import { QueryClient } from "@tanstack/react-query";
import { fetchNotes, NOTES_CACHE_TIMES } from "../hooks/use-notes-queries";

export const prefetchNotes = async (
  queryClient: QueryClient,
  videoId: string,
) => {
  return queryClient.prefetchQuery({
    queryKey: ["notes", videoId],
    queryFn: () => fetchNotes(videoId),
    staleTime: NOTES_CACHE_TIMES.STALE_TIME,
  });
};
