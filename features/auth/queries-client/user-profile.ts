'use client';

import { useQuery } from '@tanstack/react-query';
import { IAuthUserProfileWithCredits } from '@/features/auth/types';
import {
  AUTH_API_ENDPOINTS,
  USER_PROFILE_QUERY_CONFIG,
  USER_PROFILE_QUERY_KEY,
} from '@/features/auth/constants';

const fetchUserProfile = async (): Promise<IAuthUserProfileWithCredits> => {
  const response = await fetch(AUTH_API_ENDPOINTS.USER_PROFILE);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: fetchUserProfile,
    staleTime: USER_PROFILE_QUERY_CONFIG.STALE_TIME,
    gcTime: USER_PROFILE_QUERY_CONFIG.GC_TIME,
    retry: USER_PROFILE_QUERY_CONFIG.RETRY_COUNT,
    refetchOnWindowFocus: false,
  });
};

export const useUserProfileWithRefetch = () => {
  const query = useUserProfile();

  const refetchUserProfile = () => {
    return query.refetch();
  };

  return {
    ...query,
    refetchUserProfile,
  };
};
