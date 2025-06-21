import { queryOptions } from '@tanstack/react-query';
import { USER_SUBSCRIPTION_QUERY_KEY, USER_SUBSCRIPTION_QUERY_URL } from '../constants';
import type { IUserSubscriptionResponse } from '../types';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_COUNT = 2;
const ENHANCED_RETRY_COUNT = 3;
const MAX_RETRY_DELAY = 30000; // 30 seconds

class SubscriptionFetchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly statusText?: string,
  ) {
    super(message);
    this.name = 'SubscriptionFetchError';
  }
}

async function fetchUserSubscription(): Promise<IUserSubscriptionResponse> {
  try {
    const response = await fetch(USER_SUBSCRIPTION_QUERY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new SubscriptionFetchError(
        `Failed to fetch subscription: ${response.statusText}`,
        response.status,
        response.statusText,
      );
    }

    const data: IUserSubscriptionResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SubscriptionFetchError) {
      throw error;
    }

    throw new SubscriptionFetchError('Network error while fetching subscription data');
  }
}

const calculateRetryDelay = (attemptIndex: number): number => {
  const baseDelay = 1000; // 1 second
  const exponentialDelay = baseDelay * 2 ** attemptIndex;
  return Math.min(exponentialDelay, MAX_RETRY_DELAY);
};

export const userSubscriptionOptions = queryOptions({
  queryKey: [USER_SUBSCRIPTION_QUERY_KEY],
  queryFn: fetchUserSubscription,
  staleTime: CACHE_TIME,
  retry: DEFAULT_RETRY_COUNT,
  retryDelay: calculateRetryDelay,
});

export const userSubscriptionWithRetryOptions = queryOptions({
  queryKey: [USER_SUBSCRIPTION_QUERY_KEY],
  queryFn: fetchUserSubscription,
  staleTime: CACHE_TIME,
  retry: ENHANCED_RETRY_COUNT,
  retryDelay: calculateRetryDelay,
});

export type { IUserSubscriptionResponse };
export { SubscriptionFetchError };
