"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { registerSchema } from "../schemas";
import { registerAction } from "../actions";
import type { IRegisterFormData } from "../types";
import { useRouter } from "next/navigation";
import { routes } from "@/routes";

type UseRegisterReturn = {
  form: ReturnType<typeof useForm<IRegisterFormData>>;
  onSubmit: (data: IRegisterFormData) => void;
  register: ReturnType<typeof useForm<IRegisterFormData>>["register"];
  handleSubmit: ReturnType<typeof useForm<IRegisterFormData>>["handleSubmit"];
  errors: ReturnType<typeof useForm<IRegisterFormData>>["formState"]["errors"];
  isSubmitting: boolean;
  isLoading: boolean;
  password: string;
  confirmPassword: string;
  passwordRequirements: {
    hasMinLength: boolean;
  };
};

export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();

  const { execute, isPending } = useAction(registerAction, {
    onError: ({ error }) => {
      toast.error({
        description:
          error.serverError ||
          "An unexpected error occurred during registration",
      });
    },
    onSuccess: () => {
      toast.success({
        title: "Account created successfully!",
        description:
          "Sign up successful. Please check your email for verification.",
      });
      router.push(routes.auth.login);
    },
  });

  const form = useForm<IRegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const passwordRequirements = {
    hasMinLength: password.length >= 8,
  };

  const onSubmit = (data: IRegisterFormData) => {
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
    password,
    confirmPassword,
    passwordRequirements,
  };
};
