import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ServerSupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getServerSupabaseConfig(): ServerSupabaseConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createServerSupabaseClient() {
  const config = getServerSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Route handlers and actions can.
        }
      },
    },
  });
}

export async function maybeCreateServerSupabaseClient() {
  if (!getServerSupabaseConfig()) {
    return null;
  }

  return createServerSupabaseClient();
}
