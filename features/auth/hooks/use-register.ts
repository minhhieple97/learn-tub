'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { toast } from '@/hooks/use-toast';
import { registerSchema } from '../schemas';
import { registerAction } from '../actions';
import type { IRegisterFormData } from '../types';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';

type UseRegisterReturn = {
  register: ReturnType<typeof useForm<IRegisterFormData>>['register'];
  handleSubmit: ReturnType<typeof useForm<IRegisterFormData>>['handleSubmit'];
  errors: ReturnType<typeof useForm<IRegisterFormData>>['formState']['errors'];
  isSubmitting: boolean;
  isLoading: boolean;
  password: string;
  confirmPassword: string;
  passwordRequirements: {
    hasMinLength: boolean;
  };
  onSubmit: (data: IRegisterFormData) => Promise<void>;
};

export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();

  const { execute, isPending } = useAction(registerAction, {
    onError: ({ error }) => {
      toast.error({
        description: error.serverError || 'An unexpected error occurred during registration',
      });
    },
    onSuccess: () => {
      toast.success({
        title: 'Account created successfully!',
        description: 'Welcome to LearnTub. You can now start learning.',
      });
      router.push(routes.auth.login);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<IRegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  const passwordRequirements = {
    hasMinLength: password.length >= 8,
  };

  const onSubmit = async (data: IRegisterFormData) => {
    execute(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isLoading: isPending,
    password,
    confirmPassword,
    passwordRequirements,
    onSubmit,
  };
};
