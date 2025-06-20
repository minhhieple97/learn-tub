import { useQuery } from '@tanstack/react-query';
import { IUserSubscriptionResponse } from '../types';

async function fetchUserSubscription(): Promise<IUserSubscriptionResponse> {
  const response = await fetch('/api/user/subscription');

  if (!response.ok) {
    throw new Error('Failed to fetch subscription');
  }

  return response.json();
}

export function useUserSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: fetchUserSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
