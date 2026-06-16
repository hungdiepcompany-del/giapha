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

function logSafeAuthCallbackError(error: {
  code?: unknown;
  message?: string;
  name?: string;
  status?: unknown;
}) {
  console.error("Auth callback exchange failed", {
    code: typeof error.code === "string" ? error.code : undefined,
    message: error.message,
    name: error.name,
    status:
      typeof error.status === "number" || typeof error.status === "string"
        ? error.status
        : undefined,
  });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const callbackErrorCode = requestUrl.searchParams.get("error_code");
  const callbackError = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");

  if (callbackErrorCode || callbackError) {
    return redirectTo(
      request,
      "/auth/login",
      callbackErrorCode ?? callbackError ?? "auth_callback_failed",
    );
  }

  if (!code) {
    return redirectTo(request, "/auth/login", "missing_auth_code");
  }

  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return redirectTo(request, "/auth/login", "missing_supabase_config");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logSafeAuthCallbackError(error);
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
