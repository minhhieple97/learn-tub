import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useDebounce } from '@/hooks/use-debounce';
import { useMemo, useCallback, useEffect } from 'react';
import type { IQuizFilters } from '../types';

export const useQuizDashboardFilters = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [difficulty, setDifficulty] = useQueryState('difficulty', parseAsString.withDefault('all'));
  const [videoId, setVideoId] = useQueryState('videoId', parseAsString.withDefault(''));
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault('created_at'));
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', parseAsString.withDefault('desc'));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(
    (): Partial<IQuizFilters> => ({
      search: debouncedSearch,
      difficulty: difficulty as IQuizFilters['difficulty'],
      videoId: videoId || undefined,
      sortBy: sortBy as IQuizFilters['sortBy'],
      sortOrder: sortOrder as IQuizFilters['sortOrder'],
      page,
      limit: 10,
    }),
    [debouncedSearch, difficulty, videoId, sortBy, sortOrder, page],
  );

  // Build URL with current parameters
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    if (videoId) params.set('videoId', videoId);
    if (sortBy !== 'created_at') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page !== 1) params.set('page', page.toString());

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, [search, difficulty, videoId, sortBy, sortOrder, page]);

  const navigateWithTransition = useCallback(
    (callback: () => void) => {
      startTransition(() => {
        callback();
        // Use router.push to navigate to the new URL
        const newUrl = window.location.pathname + buildUrl();
        router.push(newUrl);
      });
    },
    [router, buildUrl],
  );

  // Handle debounced search changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      // When debounced search changes, trigger navigation
      startTransition(() => {
        const params = new URLSearchParams();

        if (debouncedSearch) params.set('search', debouncedSearch);
        if (difficulty !== 'all') params.set('difficulty', difficulty);
        if (videoId) params.set('videoId', videoId);
        if (sortBy !== 'created_at') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
        // Reset to page 1 when search changes
        params.set('page', '1');

        const queryString = params.toString();
        const newUrl = window.location.pathname + (queryString ? `?${queryString}` : '');
        router.push(newUrl);
      });
    }
  }, [debouncedSearch, search, difficulty, videoId, sortBy, sortOrder, router]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      // For search, just update the state - debounce will handle navigation
      if (key === 'search') {
        setSearch(value);
        setPage(1); // Reset page immediately for search
        return;
      }

      // For other filters, navigate immediately
      navigateWithTransition(() => {
        setPage(1);

        switch (key) {
          case 'difficulty':
            setDifficulty(value);
            break;
          case 'videoId':
            setVideoId(value);
            break;
          case 'sortBy':
            setSortBy(value);
            break;
          case 'sortOrder':
            setSortOrder(value);
            break;
        }
      });
    },
    [
      setSearch,
      setPage,
      navigateWithTransition,
      setDifficulty,
      setVideoId,
      setSortBy,
      setSortOrder,
    ],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigateWithTransition(() => {
        setPage(newPage);
      });
    },
    [navigateWithTransition, setPage],
  );

  const clearFilters = useCallback(() => {
    navigateWithTransition(() => {
      setSearch('');
      setDifficulty('all');
      setVideoId('');
      setSortBy('created_at');
      setSortOrder('desc');
      setPage(1);
    });
  }, [
    navigateWithTransition,
    setSearch,
    setDifficulty,
    setVideoId,
    setSortBy,
    setSortOrder,
    setPage,
  ]);

  const hasActiveFilters = search || difficulty !== 'all' || videoId;

  return {
    // Current filter values
    search,
    difficulty,
    videoId,
    sortBy,
    sortOrder,
    page,
    filters,

    // Actions
    handleFilterChange,
    handlePageChange,
    clearFilters,
    setPage,

    // State
    hasActiveFilters,
    isPending,
  };
};
