"use client";

import { useQuery } from "@tanstack/react-query";
import { IUserProfile } from "@/features/auth/types";

const fetchUserProfile = async (): Promise<IUserProfile> => {
  const response = await fetch("/api/user/profile");
  if (!response.ok) throw new Error("Failed to fetch user data");
  return response.json();
};

export const USER_PROFILE_QUERY_KEY = ["userProfile"] as const;

export function useUserProfile() {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useUserProfileWithRefetch() {
  const query = useUserProfile();

  const refetchUserProfile = () => {
    return query.refetch();
  };

  return {
    ...query,
    refetchUserProfile,
  };
}
