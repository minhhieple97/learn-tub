"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GoogleAuthButton } from './google-auth-button';
import { useLogin } from '@/features/auth/hooks/use-login';

export const LoginForm = () => {
  const { form, onSubmit, isSubmitting, isLoading } = useLogin();

  return (
    <div className="space-y-4">
      <GoogleAuthButton mode="signin" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    {...field}
                    placeholder="Enter your email address"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    placeholder="Enter your password"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
