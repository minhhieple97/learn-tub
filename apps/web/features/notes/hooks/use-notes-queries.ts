"use client";

import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

import { INote, INotesSearchResponse } from '../types';

// Constants for cache configuration
export const NOTES_CACHE_TIMES = {
  STALE_TIME: 30 * 1000, // 30 seconds
  GC_TIME: 5 * 60 * 1000, // 5 minutes
  SEARCH_STALE_TIME: 10 * 1000, // 10 seconds
  SEARCH_GC_TIME: 2 * 60 * 1000, // 2 minutes
} as const;

export const NOTES_QUERY_KEYS = {
  all: ['notes'] as const,
  byVideo: (videoId: string) => ['notes', 'video', videoId] as const,
  search: (videoId: string, query: string) => ['notes', 'search', videoId, query] as const,
};

export const fetchNotes = async (videoId: string): Promise<INote[]> => {
  const response = await fetch(`/api/notes?videoId=${videoId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  const result: INotesSearchResponse = await response.json();
  return result.data;
};

const searchNotes = async (videoId: string, searchQuery: string): Promise<INote[]> => {
  const response = await fetch(
    `/api/notes?videoId=${videoId}&search=${encodeURIComponent(searchQuery)}`,
  );
  if (!response.ok) {
    throw new Error('Failed to search notes');
  }
  const result: INotesSearchResponse = await response.json();
  return result.data;
};

export const useNotesQuery = (videoId: string | null | undefined) => {
  return useQuery({
    queryKey: NOTES_QUERY_KEYS.byVideo(videoId || ''),
    queryFn: () => fetchNotes(videoId!),
    enabled: Boolean(videoId),
    staleTime: NOTES_CACHE_TIMES.STALE_TIME,
    gcTime: NOTES_CACHE_TIMES.GC_TIME,
  });
};

export const useNotesSearch = (videoId: string | null | undefined, searchQuery: string) => {
  return useQuery({
    queryKey: NOTES_QUERY_KEYS.search(videoId || '', searchQuery),
    queryFn: () => searchNotes(videoId!, searchQuery),
    enabled: Boolean(videoId) && Boolean(searchQuery.trim()),
    staleTime: NOTES_CACHE_TIMES.SEARCH_STALE_TIME,
    gcTime: NOTES_CACHE_TIMES.SEARCH_GC_TIME,
  });
};

export const useInvalidateNotes = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.all }),
    invalidateByVideo: (videoId: string) =>
      queryClient.invalidateQueries({
        queryKey: NOTES_QUERY_KEYS.byVideo(videoId),
      }),
    invalidateSearch: (videoId: string) =>
      queryClient.invalidateQueries({ queryKey: ['notes', 'search', videoId] }),
  };
};
