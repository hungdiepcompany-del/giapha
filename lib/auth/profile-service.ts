import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { maybeCreateAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  createServerSupabaseClient,
  maybeCreateServerSupabaseClient,
} from "@/lib/supabase/server";

export type ProfileRecord = {
  id: string;
  auth_user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export type ProfileBootstrapResult =
  | {
      status: "created" | "existing";
      user: User;
      profile: ProfileRecord;
    }
  | {
      status:
        | "anonymous"
        | "missing_supabase_config"
        | "missing_admin_config"
        | "profile_lookup_failed"
        | "profile_create_failed";
      user: User | null;
      profile: null;
      reason: string;
    };

function getDisplayName(user: User) {
  const metadata = user.user_metadata;
  const fullName = metadata?.full_name;
  const name = metadata?.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  return user.email ?? null;
}

export async function getCurrentAuthUser(supabase?: SupabaseClient) {
  const serverSupabase = supabase ?? (await maybeCreateServerSupabaseClient());

  if (!serverSupabase) {
    return {
      user: null,
      error: "missing_supabase_config",
    };
  }

  const {
    data: { user },
    error,
  } = await serverSupabase.auth.getUser();

  if (error) {
    return {
      user: null,
      error: error.message,
    };
  }

  return {
    user,
    error: null,
  };
}

export async function ensureCurrentUserProfile(
  supabase?: SupabaseClient,
): Promise<ProfileBootstrapResult> {
  const serverSupabase = supabase ?? (await createServerSupabaseClient());
  const {
    data: { user },
    error: userError,
  } = await serverSupabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "anonymous",
      user: null,
      profile: null,
      reason: userError?.message ?? "No authenticated user.",
    };
  }

  const adminSupabase = maybeCreateAdminSupabaseClient();

  if (!adminSupabase) {
    return {
      status: "missing_admin_config",
      user,
      profile: null,
      reason: "Missing SUPABASE_SERVICE_ROLE_KEY for server-side bootstrap.",
    };
  }

  const { data: existingProfile, error: lookupError } = await adminSupabase
    .from("profiles")
    .select(
      "id, auth_user_id, display_name, email, avatar_url, status, created_at, updated_at",
    )
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRecord>();

  if (lookupError) {
    return {
      status: "profile_lookup_failed",
      user,
      profile: null,
      reason: lookupError.message,
    };
  }

  if (existingProfile) {
    return {
      status: "existing",
      user,
      profile: existingProfile,
    };
  }

  const { data: createdProfile, error: createError } = await adminSupabase
    .from("profiles")
    .insert({
      auth_user_id: user.id,
      display_name: getDisplayName(user),
      email: user.email ?? null,
      avatar_url:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
    })
    .select(
      "id, auth_user_id, display_name, email, avatar_url, status, created_at, updated_at",
    )
    .single<ProfileRecord>();

  if (createError || !createdProfile) {
    return {
      status: "profile_create_failed",
      user,
      profile: null,
      reason: createError?.message ?? "Profile insert did not return a row.",
    };
  }

  return {
    status: "created",
    user,
    profile: createdProfile,
  };
}
