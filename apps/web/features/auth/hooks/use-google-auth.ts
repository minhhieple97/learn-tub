"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast, useToast } from "@/hooks/use-toast";
import { env } from "@/env.mjs";
import { routes } from "@/routes";

type UseGoogleAuthReturn = {
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
};

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}${routes.auth.callback}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error({
          title: "Authentication Error",
          description: "Failed to authenticate with Google. Please try again.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
  };
};
