'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/react-query/theme-toggle';
import { LogOut, User as UserIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { signOutAction } from '@/features/auth/actions';
import { useAction } from 'next-safe-action/hooks';
import { toast } from '@/hooks/use-toast';

type IHeaderProps = {
  user: User;
};

export const Header = ({ user }: IHeaderProps) => {
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

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome back!</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="size-4" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isPending}>
            <LogOut className="mr-2 size-4" />
            {isPending ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </header>
  );
};
