import { queryOptions } from '@tanstack/react-query';
import { USER_SUBSCRIPTION_QUERY_KEY, USER_SUBSCRIPTION_QUERY_URL } from '../constants';

export const userSubscriptionOptions = queryOptions({
  queryKey: [USER_SUBSCRIPTION_QUERY_KEY],
  queryFn: async () => {
    const response = await fetch(USER_SUBSCRIPTION_QUERY_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  },
});
