import { useState, useRef, useCallback } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { signOutAction } from '@/features/auth/actions';
import { toast } from '@/hooks/use-toast';
import { useUserProfileWithRefetch } from '@/features/auth/queries-client/user-profile';
import type { IAuthUserProfileWithCredits } from '@/features/auth/types';

type UseUserMenuProps = {
  initialUser: IAuthUserProfileWithCredits;
};

export const useUserMenu = ({ initialUser }: UseUserMenuProps) => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hasRefetchedRef = useRef(false);

  const { data: latestUser, refetchUserProfile } = useUserProfileWithRefetch();
  const user = latestUser || initialUser;

  const { execute: executeSignOut, isPending: isSigningOut } = useAction(signOutAction, {
    onError: ({ error }) => {
      toast({
        title: 'Error',
        description: error.serverError || 'Failed to sign out',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        description: 'Successfully signed out!',
      });
    },
  });

  const handleDropdownOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open);

      if (open && !hasRefetchedRef.current) {
        refetchUserProfile();
        hasRefetchedRef.current = true;
      }

      if (!open) {
        hasRefetchedRef.current = false;
      }
    },
    [refetchUserProfile],
  );

  const handleSignOut = useCallback(() => {
    executeSignOut({});
  }, [executeSignOut]);

  const handlePricingClick = useCallback(() => {
    setIsDropdownOpen(false);
    setTimeout(() => {
      setIsPricingOpen(true);
    }, 100);
  }, []);

  const handlePricingClose = useCallback(() => {
    setIsPricingOpen(false);
  }, []);

  const getUserInitials = useCallback((email: string) => {
    return email.substring(0, 2).toUpperCase();
  }, []);

  return {
    // State
    user,
    isPricingOpen,
    isDropdownOpen,
    isSigningOut,

    // Handlers
    handleDropdownOpenChange,
    handleSignOut,
    handlePricingClick,
    handlePricingClose,

    // Utils
    getUserInitials,
  };
};
