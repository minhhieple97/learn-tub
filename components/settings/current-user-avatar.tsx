"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/components/queries-client/user-profile";
import { Skeleton } from "@/components/ui/skeleton";

type CurrentUserAvatarProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

export const CurrentUserAvatar = ({
  className,
  size = "md",
}: CurrentUserAvatarProps) => {
  const { data: userProfile, isLoading } = useUserProfile();

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
    );
  }

  if (!userProfile) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  const profileImage = userProfile.user_metadata?.avatar_url;
  const name = userProfile.user_metadata?.full_name;
  const email = userProfile.email || "";
  const initials = getUserInitials(name, email);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
