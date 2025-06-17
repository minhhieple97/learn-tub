'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/react-query/theme-toggle';
import Link from 'next/link';
import { routes } from '@/routes';
import { User } from '@supabase/supabase-js';
import { UserMenu } from './user-menu';

type HeaderActionsProps = {
  user?: User | null;
};

export function HeaderActions({ user }: HeaderActionsProps) {
  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      {!user && (
        <>
          <Button
            variant="ghost"
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
            asChild
          >
            <Link href={routes.login}>Login</Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            asChild
          >
            <Link href={routes.register}>Get Started</Link>
          </Button>
        </>
      )}

      {user && <UserMenu user={user} />}
    </div>
  );
}
