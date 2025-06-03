'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { routes } from '@/routes';
import { getPasswordStrength, getPasswordStrengthColor } from '@/lib/utils';
import { registerSchema } from '../schemas';
import type { RegisterFormData } from '../types';

type UseRegisterReturn = {
  register: ReturnType<typeof useForm<RegisterFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<RegisterFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<RegisterFormData>>['formState']['errors'];
  isSubmitting: boolean;
  isLoading: boolean;
  password: string;
  passwordStrength: ReturnType<typeof getPasswordStrength>;
  passwordStrengthColor: string;
  onSubmit: (data: RegisterFormData) => Promise<void>;
};

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const password = watch('password') || '';
  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength.strength);

  const registerUser = async ({ email, password, fullName }: RegisterFormData) => {
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        toast({
          title: 'Error',
          description: signUpError.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Account created successfully!',
          description: 'Welcome to LearnTub. You can now start learning.',
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push(routes.learn);
        router.refresh();
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading,
    password,
    passwordStrength,
    passwordStrengthColor,
    onSubmit,
  };
}
