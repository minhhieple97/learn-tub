import { z } from "zod";

export const ProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name is too long"),
});
