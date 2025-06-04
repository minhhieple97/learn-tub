'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { loginSchema } from '../schemas';
import { loginAction } from '../actions';
import type { LoginFormData } from '../types';
import { useToast } from '@/hooks/use-toast';

type UseLoginReturn = {
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<LoginFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<LoginFormData>>['formState']['errors'];
  isSubmitting: boolean;
  isLoading: boolean;
  onSubmit: (data: LoginFormData) => Promise<void>;
};

export const useLogin = (): UseLoginReturn => {
  const { toast } = useToast();
  const { execute, isPending } = useAction(loginAction, {
    onError: ({ error }) => {
      toast({
        title: 'Error',
        description: error.serverError || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Successfully signed in!',
        variant: 'default',
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    execute(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading: isPending,
    onSubmit,
  };
}
