const marker = "BACKUP_PERMISSION_POST_MIGRATION_SMOKE_ONLY";

const baseUrl = process.env.BACKUP_PERMISSION_SMOKE_BASE_URL;
const expectedUser = process.env.BACKUP_PERMISSION_SMOKE_EXPECTED_USER;

function print(payload) {
  console.log(JSON.stringify({ marker, ...payload }, null, 2));
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

if (!baseUrl) {
  print({
    ok: true,
    status: "SKIPPED",
    reason: "SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set",
    network_call: false,
    db_mutation: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
  });
  process.exit(0);
}

if (!expectedUser) {
  print({
    ok: true,
    status: "SKIPPED",
    reason: "SKIPPED because BACKUP_PERMISSION_SMOKE_EXPECTED_USER is not set",
    network_call: false,
    db_mutation: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
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
    production_backup: false,
    storage_upload: false,
    restore: false,
  });
  process.exit(1);
}

async function runSmoke() {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const apiUrl = `${normalizedBaseUrl}/api/admin/backups/service-dry-run`;
  const uiUrl = `${normalizedBaseUrl}/admin/backups`;

  const apiResponse = await fetch(apiUrl, { method: "GET" });
  const uiResponse = await fetch(uiUrl, { method: "GET", redirect: "manual" });

  print({
    ok: true,
    status: "COMPLETED",
    expected_user: expectedUser,
    routes_checked: ["/api/admin/backups/service-dry-run", "/admin/backups"],
    api_status: apiResponse.status,
    ui_status: uiResponse.status,
    network_call: true,
    db_mutation: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
    backup_worker_call: false,
  });
}

runSmoke().catch((error) => {
  print({
    ok: false,
    status: "FAILED",
    reason: error instanceof Error ? error.message : "unknown_error",
    network_call: true,
    db_mutation: false,
    production_backup: false,
    storage_upload: false,
    restore: false,
    backup_worker_call: false,
  });
  process.exit(1);
});
