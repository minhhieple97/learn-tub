import { Database } from "@/database.types";
import { env } from "@/env.mjs";
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  );
};
