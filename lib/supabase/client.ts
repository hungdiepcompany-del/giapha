import { createBrowserClient } from "@supabase/ssr";

export type PublicSupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createClientSupabaseClient() {
  const config = getPublicSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}
