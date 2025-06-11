import type { z } from 'zod';
import type { loginSchema, registerSchema } from './schemas';
import { IActionResult } from '@/types';

export type ILoginFormData = z.infer<typeof loginSchema>;
export type IRegisterFormData = z.infer<typeof registerSchema>;

export type IAuthMode = 'signin' | 'signup';

export type IAuthError = {
  message: string;
  field?: string;
};

export type IAuthResponse = IActionResult;
