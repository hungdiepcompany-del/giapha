const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = process.cwd();

const requiredAdminPermissions = [
  "people.view",
  "people.create",
  "people.update",
  "people.delete",
  "people.restore",
  "relationships.view",
  "relationships.create",
  "relationships.update",
  "relationships.delete",
  "tree.view",
  "tree.edit_layout",
  "revisions.view",
  "exports.create",
  "exports.download",
  "imports.create",
  "settings.manage",
  "permissions.manage",
];

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

function baseResult(env) {
  return {
    ENV_SUPABASE_URL_PRESENT: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    ENV_SUPABASE_ANON_PRESENT: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    ENV_SERVICE_ROLE_PRESENT: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    ADMIN_CLIENT_READY: false,
    AUTH_USER_FOUND: false,
    PROFILE_FOUND: false,
    ROLE_COUNT: 0,
    PERMISSION_COUNT: 0,
    REQUIRED_ADMIN_PERMISSION_MISSING_COUNT: null,
    READINESS_STATUS: "SAFE_SKIP",
    READINESS_REASON: "NOT_RUN",
  };
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  const env = {
    ...parseEnvFile(".env.local"),
    ...process.env,
  };
  const result = baseResult(env);

  if (
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.A15C_OWNER_EMAIL
  ) {
    result.READINESS_REASON = "MISSING_REQUIRED_ENV";
    printResult(result);
    return;
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  result.ADMIN_CLIENT_READY = true;

  const users = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (users.error) {
    result.READINESS_STATUS = "FAIL";
    result.READINESS_REASON = "AUTH_USERS_LOOKUP_FAILED";
    result.ERROR = users.error.message;
    printResult(result);
    return;
  }

  const ownerEmail = env.A15C_OWNER_EMAIL.toLowerCase();
  const owner = (users.data.users ?? []).find(
    (user) => (user.email ?? "").toLowerCase() === ownerEmail,
  );

  result.AUTH_USER_FOUND = Boolean(owner);

  if (!owner) {
    result.READINESS_REASON = "AUTH_USER_NOT_FOUND";
    printResult(result);
    return;
  }

  const profile = await supabase
    .from("profiles")
    .select("id,status")
    .eq("auth_user_id", owner.id)
    .maybeSingle();

  if (profile.error) {
    result.READINESS_STATUS = "FAIL";
    result.READINESS_REASON = "PROFILE_LOOKUP_FAILED";
    result.ERROR = profile.error.message;
    printResult(result);
    return;
  }

  result.PROFILE_FOUND = Boolean(profile.data);

  if (!profile.data) {
    result.READINESS_REASON = "PROFILE_NOT_FOUND";
    printResult(result);
    return;
  }

  const profileRoles = await supabase
    .from("profile_roles")
    .select("role_id")
    .eq("profile_id", profile.data.id);

  if (profileRoles.error) {
    result.READINESS_STATUS = "FAIL";
    result.READINESS_REASON = "PROFILE_ROLES_LOOKUP_FAILED";
    result.ERROR = profileRoles.error.message;
    printResult(result);
    return;
  }

  const roleIds = [
    ...new Set((profileRoles.data ?? []).map((row) => row.role_id)),
  ];
  result.ROLE_COUNT = roleIds.length;

  if (roleIds.length === 0) {
    result.READINESS_REASON = "ROLE_COUNT_ZERO";
    printResult(result);
    return;
  }

  const rolePermissions = await supabase
    .from("role_permissions")
    .select("permission_id")
    .in("role_id", roleIds);

  if (rolePermissions.error) {
    result.READINESS_STATUS = "FAIL";
    result.READINESS_REASON = "ROLE_PERMISSIONS_LOOKUP_FAILED";
    result.ERROR = rolePermissions.error.message;
    printResult(result);
    return;
  }

  const permissionIds = [
    ...new Set((rolePermissions.data ?? []).map((row) => row.permission_id)),
  ];

  if (permissionIds.length === 0) {
    result.READINESS_REASON = "PERMISSION_COUNT_ZERO";
    result.PERMISSION_COUNT = 0;
    printResult(result);
    return;
  }

  const permissions = await supabase
    .from("permissions")
    .select("code")
    .in("id", permissionIds);

  if (permissions.error) {
    result.READINESS_STATUS = "FAIL";
    result.READINESS_REASON = "PERMISSIONS_LOOKUP_FAILED";
    result.ERROR = permissions.error.message;
    printResult(result);
    return;
  }

  const permissionCodes = [
    ...new Set((permissions.data ?? []).map((row) => row.code)),
  ];
  const missing = requiredAdminPermissions.filter(
    (permission) => !permissionCodes.includes(permission),
  );

  result.PERMISSION_COUNT = permissionCodes.length;
  result.REQUIRED_ADMIN_PERMISSION_MISSING_COUNT = missing.length;
  result.READINESS_STATUS = missing.length === 0 ? "PASS" : "FAIL";
  result.READINESS_REASON =
    missing.length === 0
      ? "OWNER_ADMIN_PERMISSION_READY_READ_ONLY"
      : "REQUIRED_ADMIN_PERMISSION_MISSING";

  printResult(result);
}

main().catch((error) => {
  const env = {
    ...parseEnvFile(".env.local"),
    ...process.env,
  };
  const result = baseResult(env);
  result.READINESS_STATUS = "FAIL";
  result.READINESS_REASON = "UNEXPECTED_ERROR";
  result.ERROR = error instanceof Error ? error.message : String(error);
  printResult(result);
});
