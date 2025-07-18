import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/routes";

const ConfirmParamsSchema = z.object({
  token_hash: z.string().min(1, "Token hash is required"),
  type: z.enum([
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "phone_change",
    "email",
  ] as const),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawParams = {
    token_hash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
  };

  const validationResult = ConfirmParamsSchema.safeParse(rawParams);

  if (!validationResult.success) {
    console.error(
      "Invalid confirmation parameters:",
      validationResult.error.errors,
    );
    redirect(routes.auth.authCodeError);
  }

  const { token_hash, type } = validationResult.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash,
  });

  if (!error) {
    redirect(routes.home);
  }

  redirect(routes.auth.authCodeError);
}
