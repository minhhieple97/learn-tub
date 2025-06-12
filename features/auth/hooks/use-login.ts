'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { loginSchema } from '../schemas';
import { loginAction } from '../actions';
import type { ILoginFormData } from '../types';
import { toast, useToast } from '@/hooks/use-toast';

type UseLoginReturn = {
  form: ReturnType<typeof useForm<ILoginFormData>>;
  onSubmit: (data: ILoginFormData) => void;
  register: ReturnType<typeof useForm<ILoginFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<ILoginFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<ILoginFormData>>['formState']['errors'];
  isSubmitting: boolean;
  isLoading: boolean;
};

export const useLogin = (): UseLoginReturn => {
  const { execute, isPending } = useAction(loginAction, {
    onError: ({ error }) => {
      toast.error({
        title: 'Error',
        description: error.serverError || 'An unexpected error occurred',
      });
    },
    onSuccess: (data) => {
      toast.success({
        description: 'Successfully signed in!',
      });
    },
  });

  const form = useForm<ILoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = (data: ILoginFormData) => {
    execute(data);
  };

  return {
    form,
    onSubmit,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading: isPending,
  };
};
