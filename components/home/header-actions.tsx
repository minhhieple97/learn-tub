"use client";

import { ThemeToggle } from "@/components/shared/react-query/theme-toggle";
import { UserMenu } from "./user-menu";
import { IAuthUserProfileWithCredits } from "@/features/auth/types";

type HeaderActionsProps = {
  user: IAuthUserProfileWithCredits;
};

export function HeaderActions({ user }: HeaderActionsProps) {
  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <UserMenu user={user} />
    </div>
  );
}
