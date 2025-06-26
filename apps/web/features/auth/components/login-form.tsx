"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GoogleAuthButton } from "./google-auth-button";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Loader2 } from "lucide-react";

export const LoginForm = () => {
  const { form, onSubmit, isSubmitting, isLoading } = useLogin();

  return (
    <div className="space-y-4 sm:space-y-6">
      <GoogleAuthButton mode="signin" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 sm:space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5 sm:space-y-2">
                <FormLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    {...field}
                    className="h-10 sm:h-11 transition-colors focus-visible:ring-blue-500"
                    placeholder="Enter your email address"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5 sm:space-y-2">
                <FormLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    {...field}
                    className="h-10 sm:h-11 transition-colors focus-visible:ring-blue-500"
                    placeholder="Enter your password"
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl transition-all duration-200"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
