import type { z } from "zod";
import type { loginSchema, registerSchema } from "./schemas";
import { IActionResult, IUserProfile } from "@/types";
import { User } from "@supabase/supabase-js";

export type ILoginFormData = z.infer<typeof loginSchema>;
export type IRegisterFormData = z.infer<typeof registerSchema>;

export type IAuthMode = "signin" | "signup";

export type IAuthError = {
  message: string;
  field?: string;
};

export type IAuthResponse = IActionResult;

export type IAuthUserProfile = IUserProfile;

export type IAuthUserProfileWithCredits = IAuthUserProfile & {
  credits: number;
};
