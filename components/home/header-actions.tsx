"use client";

import { ThemeToggle } from "@/components/shared/react-query/theme-toggle";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "./user-menu";

type HeaderActionsProps = {
  user: User & {
    credits: number;
  };
};

export function HeaderActions({ user }: HeaderActionsProps) {
  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <UserMenu user={user} />
    </div>
  );
}
