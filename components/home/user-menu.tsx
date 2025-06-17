'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, CreditCard, Settings } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { signOutAction } from '@/features/auth/actions';
import { useAction } from 'next-safe-action/hooks';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';
import { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { PricingDialog } from '@/features/payments/components/pricing-dialog';

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { execute, isPending } = useAction(signOutAction, {
    onError: ({ error }) => {
      toast.error({
        title: 'Error',
        description: error.serverError || 'Failed to sign out',
      });
    },
    onSuccess: () => {
      toast.success({
        description: 'Successfully signed out!',
      });
    },
  });

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
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getUserInitials(user.email || 'US')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {user.user_metadata?.full_name || 'User'}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePricingClick} className="cursor-pointer">
            <CreditCard className="mr-2 size-4" />
            <span>Pricing & Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 size-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="cursor-pointer text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
          >
            <LogOut className="mr-2 size-4" />
            <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isPricingOpen} onOpenChange={handlePricingClose}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent className="max-w-5xl p-2 overflow-y-auto max-h-[90vh] bg-transparent border-0 shadow-none">
          <PricingDialog onClose={handlePricingClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
