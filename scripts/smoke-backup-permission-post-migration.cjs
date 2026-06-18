const marker = "BACKUP_PERMISSION_POST_MIGRATION_SMOKE_ONLY";
const authenticatedMarker =
  "BACKUP_OPERATOR_AUTHENTICATED_SMOKE_SHELL_ONLY";

const baseUrl = process.env.BACKUP_PERMISSION_SMOKE_BASE_URL;
const expectedUser = process.env.BACKUP_PERMISSION_SMOKE_EXPECTED_USER;
const authCookie = process.env.BACKUP_PERMISSION_SMOKE_AUTH_COOKIE;
const bearerToken = process.env.BACKUP_PERMISSION_SMOKE_BEARER_TOKEN;

function print(payload) {
  console.log(
    JSON.stringify(
      {
        marker,
        authenticated_marker: authenticatedMarker,
        ...payload,
        auth_material_printed: false,
        backup_worker_call: false,
        production_backup: false,
        storage_upload: false,
        restore: false,
      },
      null,
      2,
    ),
  );
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

if (!baseUrl) {
  print({
    ok: true,
    status: "SKIPPED",
    reason: "SKIPPED_MISSING_EXPLICIT_ENV",
    legacy_reason:
      "SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set",
    missing: ["BACKUP_PERMISSION_SMOKE_BASE_URL"],
    network_call: false,
    db_mutation: false,
  });
  process.exit(0);
}

if (!expectedUser) {
  print({
    ok: true,
    status: "SKIPPED",
    reason: "SKIPPED_MISSING_EXPLICIT_ENV",
    legacy_reason:
      "SKIPPED because BACKUP_PERMISSION_SMOKE_EXPECTED_USER is not set",
    missing: ["BACKUP_PERMISSION_SMOKE_EXPECTED_USER"],
    network_call: false,
    db_mutation: false,
  });
  process.exit(0);
}

if (!authCookie && !bearerToken) {
  print({
    ok: true,
    status: "SKIPPED",
    reason: "SKIPPED_MISSING_EXPLICIT_ENV",
    missing: [
      "BACKUP_PERMISSION_SMOKE_AUTH_COOKIE_OR_BEARER_TOKEN",
    ],
    network_call: false,
    db_mutation: false,
  });
  process.exit(0);
}

if (!/^https?:\/\//i.test(baseUrl)) {
  print({
    ok: false,
    status: "FAILED",
    reason: "BACKUP_PERMISSION_SMOKE_BASE_URL must start with http:// or https://",
    network_call: false,
    db_mutation: false,
  });
  process.exit(1);
}

async function runSmoke() {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const apiUrl = `${normalizedBaseUrl}/api/admin/backups/service-dry-run`;
  const uiUrl = `${normalizedBaseUrl}/admin/backups`;
  const authHeaders = authCookie
    ? { Cookie: authCookie }
    : { Authorization: `Bearer ${bearerToken}` };

  const apiResponse = await fetch(apiUrl, {
    method: "GET",
    headers: authHeaders,
    redirect: "manual",
  });
  const apiContentType = apiResponse.headers.get("content-type") || "";
  const apiPayload = apiContentType.includes("application/json")
    ? await apiResponse.json()
    : null;
  const uiResponse = await fetch(uiUrl, {
    method: "GET",
    headers: authHeaders,
    redirect: "manual",
  });
  const apiDryRunSafe =
    apiResponse.ok &&
    apiPayload?.mode === "dry_run" &&
    apiPayload?.worker_call === false &&
    apiPayload?.production_backup === false &&
    apiPayload?.storage_upload === false &&
    apiPayload?.restore === false;
  const uiAuthenticated =
    uiResponse.status === 200 &&
    !["/auth/login", "/unauthorized"].some((route) =>
      (uiResponse.headers.get("location") || "").includes(route),
    );
  const ok = apiDryRunSafe && uiAuthenticated;

  print({
    ok,
    status: ok ? "PASS" : "FAIL",
    expected_user_configured: Boolean(expectedUser),
    auth_method: authCookie ? "cookie" : "bearer",
    routes_checked: ["/api/admin/backups/service-dry-run", "/admin/backups"],
    api_status: apiResponse.status,
    ui_status: uiResponse.status,
    api_dry_run_safe: apiDryRunSafe,
    ui_authenticated: uiAuthenticated,
    network_call: true,
    db_mutation: false,
  });

  if (!ok) process.exitCode = 1;
}

runSmoke().catch(() => {
  print({
    ok: false,
    status: "FAIL",
    reason: "AUTHENTICATED_SMOKE_REQUEST_FAILED",
    network_call: true,
    db_mutation: false,
  });
  process.exitCode = 1;
});
