"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from './google-auth-button'
import { useRegister } from '@/features/auth/hooks/use-register';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export function RegisterForm() {
  const { register, handleSubmit, errors, isSubmitting, isLoading, onSubmit } = useRegister();

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2 mb-4">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            {...register('fullName')}
            className={`transition-colors ${
              errors.fullName
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-blue-500'
            }`}
            placeholder="Enter your full name"
            disabled={isLoading || isSubmitting}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={`transition-colors ${
              errors.email
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-blue-500'
            }`}
            placeholder="Enter your email address"
            disabled={isLoading || isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className={`transition-colors ${
              errors.password
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-blue-500'
            }`}
            placeholder="Create a secure password"
            disabled={isLoading || isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className={`transition-colors ${
              errors.confirmPassword
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-blue-500'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading || isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

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
    </div>
  );
}
