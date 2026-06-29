const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const baseUrl = process.env.A15C2_BASE_URL || "http://localhost:3000";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
  return fs.readFileSync(absolutePath, "utf8");
}

function parseEnvFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const env = {};

  if (!fs.existsSync(absolutePath)) return env;

  for (const rawLine of fs.readFileSync(absolutePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

async function fetchRoute(route) {
  try {
    const response = await fetch(new URL(route, baseUrl), {
      redirect: "manual",
      cache: "no-store",
    });

    return {
      ready: true,
      status: response.status,
      location: response.headers.get("location") || null,
    };
  } catch {
    return {
      ready: false,
      status: null,
      location: null,
    };
  }
}

async function main() {
  const env = {
    ...parseEnvFile(".env.local"),
    ...process.env,
  };
  const loginPage = readFile("app/auth/login/page.tsx");
  const loginForm = readFile("components/auth/login-form.tsx");
  const callbackRoute = readFile("app/auth/callback/route.ts");
  const serverClient = readFile("lib/supabase/server.ts");
  const profileService = readFile("lib/auth/profile-service.ts");
  const permissionService = readFile("lib/permissions/permission-service.ts");
  const requirePermission = readFile("lib/permissions/require-permission.ts");

  const result = {
    ENV_SUPABASE_URL_PRESENT: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    ENV_SUPABASE_ANON_PRESENT: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    ENV_SERVICE_ROLE_PRESENT: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    LOGIN_ROUTE_PRESENT: fileExists("app/auth/login/page.tsx"),
    CALLBACK_ROUTE_PRESENT: fileExists("app/auth/callback/route.ts"),
    LOGOUT_ROUTE_PRESENT: fileExists("app/auth/logout/route.ts"),
    CALLBACK_EXCHANGE_CODE_PRESENT: callbackRoute.includes("exchangeCodeForSession"),
    LOGIN_REDIRECT_TO_CALLBACK_PRESENT:
      loginForm.includes("/auth/callback") &&
      (loginForm.includes("emailRedirectTo") || loginForm.includes("redirectTo")),
    SERVER_COOKIE_CLIENT_PRESENT:
      serverClient.includes("createServerClient") &&
      serverClient.includes("cookies()") &&
      serverClient.includes("getAll()") &&
      serverClient.includes("setAll"),
    GET_CURRENT_AUTH_USER_PRESENT: profileService.includes("getCurrentAuthUser"),
    AUTH_SESSION_MISSING_REASON_PRESENT:
      requirePermission.includes("auth_session_missing") ||
      permissionService.includes("auth_session_missing") ||
      profileService.includes("auth_session_missing") ||
      (requirePermission.includes("encodeReason") &&
        requirePermission.includes("context.reason") &&
        profileService.includes("serverSupabase.auth.getUser")),
    MIDDLEWARE_AUTH_GUARD_PRESENT:
      fileExists("middleware.ts") &&
      /auth|session|redirect/i.test(readFile("middleware.ts")),
    LOGIN_COPY_PRESENT:
      loginPage.includes("Đăng nhập") || loginPage.includes("Dang nhap"),
    LOCAL_HTTP_BASE_URL: baseUrl,
    HTTP_LOCAL_SERVER_READY: false,
    HTTP_LOGIN_STATUS: null,
    HTTP_TREE_STATUS: null,
    HTTP_ADMIN_STATUS: null,
    HTTP_ADMIN_REDIRECT_LOCATION_PRESENT: false,
    HTTP_ADMIN_REDIRECTS_AUTH_SESSION_MISSING: false,
    DIAGNOSTIC_STATUS: "PARTIAL",
    DIAGNOSTIC_REASON: "UNKNOWN_NEEDS_MANUAL_BROWSER_TRACE",
  };

  const login = await fetchRoute("/auth/login");
  result.HTTP_LOCAL_SERVER_READY = login.ready;
  result.HTTP_LOGIN_STATUS = login.status;

  if (login.ready) {
    const tree = await fetchRoute("/tree");
    const admin = await fetchRoute("/admin");

    result.HTTP_TREE_STATUS = tree.status;
    result.HTTP_ADMIN_STATUS = admin.status;
    result.HTTP_ADMIN_REDIRECT_LOCATION_PRESENT = Boolean(admin.location);
    result.HTTP_ADMIN_REDIRECTS_AUTH_SESSION_MISSING = Boolean(
      admin.location && admin.location.includes("auth_session_missing"),
    );
  }

  const staticFlowPresent =
    result.LOGIN_ROUTE_PRESENT &&
    result.CALLBACK_ROUTE_PRESENT &&
    result.CALLBACK_EXCHANGE_CODE_PRESENT &&
    result.LOGIN_REDIRECT_TO_CALLBACK_PRESENT &&
    result.SERVER_COOKIE_CLIENT_PRESENT &&
    result.GET_CURRENT_AUTH_USER_PRESENT;

  if (!staticFlowPresent) {
    result.DIAGNOSTIC_STATUS = "FAIL";
    result.DIAGNOSTIC_REASON = "AUTH_FLOW_STATIC_COMPONENT_MISSING";
  } else if (!result.HTTP_LOCAL_SERVER_READY) {
    result.DIAGNOSTIC_STATUS = "PARTIAL";
    result.DIAGNOSTIC_REASON =
      "AUTH_FLOW_STATIC_PRESENT_HTTP_LOCAL_SERVER_NOT_RUNNING";
  } else if (result.HTTP_ADMIN_REDIRECTS_AUTH_SESSION_MISSING) {
    result.DIAGNOSTIC_STATUS = "PARTIAL";
    result.DIAGNOSTIC_REASON =
      "AUTH_FLOW_STATIC_PRESENT_BROWSER_SESSION_NOT_BOUND";
  } else {
    result.DIAGNOSTIC_STATUS = "PARTIAL";
    result.DIAGNOSTIC_REASON =
      "AUTH_FLOW_STATIC_PRESENT_MANUAL_CALLBACK_COOKIE_TRACE_REQUIRED";
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.log(
    JSON.stringify(
      {
        DIAGNOSTIC_STATUS: "FAIL",
        DIAGNOSTIC_REASON: "UNEXPECTED_ERROR",
        ERROR: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
