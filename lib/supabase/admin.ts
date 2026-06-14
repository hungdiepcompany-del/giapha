import "server-only";

import { createClient } from "@supabase/supabase-js";

type AdminSupabaseConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

export function getAdminSupabaseConfig(): AdminSupabaseConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createAdminSupabaseClient() {
  const config = getAdminSupabaseConfig();

  if (!config) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function maybeCreateAdminSupabaseClient() {
  if (!getAdminSupabaseConfig()) {
    return null;
  }

  return createAdminSupabaseClient();
}
