"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleAuthButton } from './google-auth-button'
import { useRegister } from '@/features/auth/hooks/use-register';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading,
    password,
    passwordStrength,
    passwordStrengthColor,
    onSubmit,
  } = useRegister();

  return (
    <div className="space-y-4">
      <GoogleAuthButton mode="signup" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            {...register('fullName')}
            className={errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
            placeholder="Create a secure password"
          />
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}

          {password && password.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Password strength: {passwordStrength.label}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthColor}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>At least 6 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {isLoading || isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
}
