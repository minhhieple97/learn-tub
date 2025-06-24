import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  useTransition,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';
import { debounce } from 'lodash';
import {
  QUIZZ_DASHBOARD_CONFIG,
  QUIZZ_FILTER_DEFAULTS,
  QUIZZ_FILTER_VALUES,
} from '@/config/constants';
import type { IQuizFilters } from '../types';

export const useQuizDashboardFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get('search') || QUIZZ_FILTER_DEFAULTS.SEARCH;
  const difficulty =
    searchParams.get('difficulty') || QUIZZ_FILTER_DEFAULTS.DIFFICULTY;
  const videoId = searchParams.get('videoId') || QUIZZ_FILTER_DEFAULTS.VIDEO_ID;
  const sortBy = searchParams.get('sortBy') || QUIZZ_FILTER_DEFAULTS.SORT_BY;
  const sortOrder =
    searchParams.get('sortOrder') || QUIZZ_FILTER_DEFAULTS.SORT_ORDER;
  const page = parseInt(
    searchParams.get('page') || QUIZZ_DASHBOARD_CONFIG.DEFAULT_PAGE.toString(),
    10,
  );

  const [localSearch, setLocalSearch] = useState(urlSearch);

  useEffect(() => {
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  const filters = useMemo(
    (): Partial<IQuizFilters> => ({
      search: urlSearch,
      difficulty: difficulty as IQuizFilters['difficulty'],
      videoId: videoId || undefined,
      sortBy: sortBy as IQuizFilters['sortBy'],
      sortOrder: sortOrder as IQuizFilters['sortOrder'],
      page,
      limit: QUIZZ_DASHBOARD_CONFIG.PAGINATION_LIMIT,
    }),
    [urlSearch, difficulty, videoId, sortBy, sortOrder, page],
  );

  const getCurrentParams = useCallback(
    (overrides: Partial<Record<string, string | number>> = {}) => ({
      search: urlSearch,
      difficulty,
      videoId,
      sortBy,
      sortOrder,
      page: QUIZZ_DASHBOARD_CONFIG.DEFAULT_PAGE,
      ...overrides,
    }),
    [urlSearch, difficulty, videoId, sortBy, sortOrder],
  );

  const buildUrl = useCallback(
    (params: Record<string, string | number>) => {
      const urlParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== QUIZZ_FILTER_VALUES.ALL && value !== '') {
          urlParams.set(key, value.toString());
        }
      });

      const queryString = urlParams.toString();
      return pathname + (queryString ? `?${queryString}` : '');
    },
    [pathname],
  );

  const debouncedSearchUpdate = useCallback(
    (searchValue: string) => {
      const params = getCurrentParams({ search: searchValue });

      startTransition(() => {
        const newUrl = buildUrl(params);
        router.push(newUrl);
      });
    },
    [getCurrentParams, buildUrl, router],
  );

  const debouncedSearch = useRef(
    debounce((value: string) => {
      debouncedSearchUpdate(value);
    }, QUIZZ_DASHBOARD_CONFIG.SEARCH_DEBOUNCE_DELAY),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === 'search') {
        setLocalSearch(value);
        debouncedSearch(value);
      } else {
        const params = getCurrentParams({ [key]: value });

        startTransition(() => {
          const newUrl = buildUrl(params);
          router.push(newUrl);
        });
      }
    },
    [getCurrentParams, buildUrl, router, debouncedSearch],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = getCurrentParams({ page: newPage });

      startTransition(() => {
        const newUrl = buildUrl(params);
        router.push(newUrl);
      });
    },
    [getCurrentParams, buildUrl, router],
  );

  const clearFilters = useCallback(() => {
    debouncedSearch.cancel();
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname, debouncedSearch]);

  const hasActiveFilters =
    urlSearch || difficulty !== QUIZZ_FILTER_VALUES.DIFFICULTIES.ALL || videoId;

  return {
    // Current filter values for UI
    search: localSearch,
    difficulty,
    videoId,
    sortBy,
    sortOrder,
    page,
    filters,

    // Filter actions
    handleFilterChange,
    handlePageChange,
    clearFilters,

    // State flags
    hasActiveFilters,
    isPending,
  };
};
