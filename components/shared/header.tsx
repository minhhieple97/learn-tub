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
import { ThemeToggle } from '@/components/shared/react-query/theme-toggle';
import {
  LogOut,
  User as UserIcon,
  CreditCard,
  Settings,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { signOutAction } from '@/features/auth/actions';
import { useAction } from 'next-safe-action/hooks';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';
import Link from 'next/link';
import { PricingList } from '@/features/payments/components';

type IHeaderProps = {
  user?: User | null;
};

export const Header = ({ user }: IHeaderProps) => {
  const router = useRouter();
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
    router.push(routes.settings.root);
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header
      className={`${
        user
          ? 'border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50'
      } px-6 py-4`}
    >
      <div className={`flex items-center justify-between ${!user ? 'container mx-auto' : ''}`}>
        {!user && (
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
              <BookOpen className="text-white size-6" />
            </div>
            <Link
              href={routes.home}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
            >
              LearnTub
            </Link>
          </div>
        )}

        {user && (
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome back!</h1>
        )}

        <div className="flex items-center space-x-4">
          {/* Learn Now Button - Always visible */}
          <Button
            variant="ghost"
            className={`${
              user
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            asChild
          >
            <Link href={routes.learn}>Learn Now</Link>
          </Button>

          {/* Pricing Dropdown - Show for non-authenticated users */}
          {!user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Pricing
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[900px] p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
                align="end"
                sideOffset={8}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    Choose Your Plan
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Start free and upgrade as you grow. All plans include unlimited note-taking.
                  </p>
                </div>
                <PricingList />
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeToggle />

          {/* Authentication Buttons - Show for non-authenticated users */}
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

          {/* User Avatar Dropdown - Show for authenticated users */}
          {user && (
            <DropdownMenu>
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
          )}
        </div>
      </div>
    </header>
  );
};
