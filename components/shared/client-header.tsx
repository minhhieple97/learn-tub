"use client";

import { HeaderContainer } from "@/components/home/header-container";
import { HeaderLogo } from "@/components/home/header-logo";
import { HeaderActions } from "@/components/home/header-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/components/queries-client/user-profile";

export function ClientHeader() {
  const { data, isLoading, error } = useUserProfile();

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
