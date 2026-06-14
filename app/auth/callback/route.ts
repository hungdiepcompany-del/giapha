import { NextResponse, type NextRequest } from "next/server";

import { ensureCurrentUserProfile } from "@/lib/auth/profile-service";
import { getPermissionContext } from "@/lib/permissions/permission-service";
import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, pathname: string, reason?: string) {
  const url = new URL(pathname, request.url);

  if (reason) {
    url.searchParams.set("reason", reason);
  }

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return redirectTo(request, "/auth/login", "missing_auth_code");
  }

  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return redirectTo(request, "/auth/login", "missing_supabase_config");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectTo(request, "/auth/login", "auth_callback_failed");
  }

  const bootstrap = await ensureCurrentUserProfile(supabase);

  if (!bootstrap.profile) {
    return redirectTo(request, "/unauthorized", bootstrap.status);
  }

  const context = await getPermissionContext();

  if (context.permissions.includes("people.view")) {
    return redirectTo(request, "/admin");
  }

  return redirectTo(request, "/unauthorized", context.reason ?? "missing_people.view");
}
