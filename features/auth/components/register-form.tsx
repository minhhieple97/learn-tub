"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GoogleAuthButton } from './google-auth-button';
import { useRegister } from '@/features/auth/hooks/use-register';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export const RegisterForm = () => {
  const { form, onSubmit, isSubmitting, isLoading } = useRegister();

  return (
    <div className="space-y-6">
      <GoogleAuthButton mode="signup" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-2 mb-4">
                <FormLabel htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    id="fullName"
                    type="text"
                    {...field}
                    className="transition-colors focus-visible:ring-blue-500"
                    placeholder="Enter your full name"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Circle className="h-3 w-3 fill-current" />
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2 mb-4">
                <FormLabel htmlFor="email" className="text-sm font-medium">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    {...field}
                    className="transition-colors focus-visible:ring-blue-500"
                    placeholder="Enter your email address"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Circle className="h-3 w-3 fill-current" />
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2 mb-4">
                <FormLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    className="transition-colors focus-visible:ring-blue-500"
                    placeholder="Create a secure password"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Circle className="h-3 w-3 fill-current" />
                </FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2 mb-4">
                <FormLabel htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...field}
                    className="transition-colors focus-visible:ring-blue-500"
                    placeholder="Confirm your password"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Circle className="h-3 w-3 fill-current" />
                </FormMessage>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium transition-all duration-200"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
