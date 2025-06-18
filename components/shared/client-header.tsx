"use client";
import { useQuery } from "@tanstack/react-query";
import { HeaderContainer } from "@/components/home/header-container";
import { HeaderLogo } from "@/components/home/header-logo";
import { HeaderActions } from "@/components/home/header-actions";
import { IUserProfile } from "@/features/auth/types";
import { Skeleton } from "@/components/ui/skeleton";

const fetchUserProfile = async (): Promise<IUserProfile> => {
  const response = await fetch("/api/user/profile");
  if (!response.ok) throw new Error("Failed to fetch user data");
  return response.json();
};

export function ClientHeader() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <HeaderContainer>
      <HeaderLogo />
      {isLoading ? (
        <HeaderSkeleton />
      ) : error ? (
        <HeaderError />
      ) : (
        <HeaderActions user={data!} />
      )}
    </HeaderContainer>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
}

function HeaderError() {
  return <div className="text-sm text-red-500">Failed to load profile</div>;
}
