"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, CreditCard, Settings, Coins } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { signOutAction } from "@/features/auth/actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { PricingDialog } from "@/features/payments/components/pricing-dialog";
import Link from "next/link";
import { routes } from "@/routes";
import { useUserProfileWithRefetch } from "@/components/queries-client/user-profile";

type UserMenuProps = {
  user: User & {
    credits: number;
  };
};

export function UserMenu({ user: initialUser }: UserMenuProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: latestUser, refetchUserProfile } = useUserProfileWithRefetch();

  const user = latestUser || initialUser;

  const { execute, isPending } = useAction(signOutAction, {
    onError: ({ error }) => {
      toast({
        title: "Error",
        description: error.serverError || "Failed to sign out",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Successfully signed out!",
      });
    },
  });

  useEffect(() => {
    if (isDropdownOpen) {
      refetchUserProfile();
    }
  }, [isDropdownOpen, refetchUserProfile]);

  const handleSignOut = () => {
    execute({});
  };

  const handlePricingClick = () => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      setIsPricingOpen(true);
    }, 100);
  };

  const handlePricingClose = () => {
    setIsPricingOpen(false);
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.email || ""}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getUserInitials(user.email || "US")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {user.user_metadata?.full_name || "User"}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />

          {(user.credits || 0) > 0 ? (
            <div className="p-3 mx-2 my-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-200 dark:bg-yellow-700/60 rounded-full">
                    <Coins className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <span className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                    Credits
                  </span>
                </div>
                <span className="font-bold text-base tabular-nums bg-white dark:bg-black/20 px-2 py-0.5 rounded-md text-yellow-700 dark:text-yellow-300 shadow-sm">
                  {user.credits || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 mx-2 my-1.5 bg-gradient-to-r from-red-50 to-orange-100 dark:from-red-950/40 dark:to-orange-900/30 rounded-lg border border-red-200 dark:border-red-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-200 dark:bg-red-700/60 rounded-full">
                    <Coins className="h-4 w-4 text-red-700 dark:text-red-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-red-800 dark:text-red-200">
                      Out of Credits
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Purchase more to continue
                    </span>
                  </div>
                </div>
                <span className="font-bold text-base bg-white dark:bg-black/20 px-2 py-0.5 rounded-md text-red-700 dark:text-red-300 shadow-sm">
                  0
                </span>
              </div>
            </div>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePricingClick}
            className="cursor-pointer"
          >
            <CreditCard className="mr-2 size-4" />
            <span>Pricing & Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 size-4" />
            <span>
              <Link href={routes.settings.root}>Account Settings</Link>
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="cursor-pointer text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
          >
            <LogOut className="mr-2 size-4" />
            <span>{isPending ? "Signing out..." : "Sign Out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPricingOpen} onOpenChange={handlePricingClose}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="max-w-5xl p-2 overflow-y-auto max-h-[90vh] bg-transparent border-0 shadow-none">
          <PricingDialog />
        </DialogContent>
      </Dialog>
    </>
  );
}
