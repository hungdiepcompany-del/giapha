const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const marker = "BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY";
const failures = [];

function log(line) {
  console.log(`[smoke:backup-operator:permission-guard] ${line}`);
}

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

log(marker);

const route = readRequired("app/api/admin/backups/service-dry-run/route.ts");
const page = readRequired("app/(admin)/admin/backups/page.tsx");
const component = readRequired("components/admin/backup-operator-dry-run-panel.tsx");
const adapter = readRequired("server/services/backup-service-client.ts");
const packageJsonText = readRequired("package.json");

requireIncludes(route, "BACKUP_OPERATOR_API_DRY_RUN_ONLY", "API dry-run marker");
requireIncludes(route, "BACKUP_OPERATOR_API_PERMISSION_GUARD", "API permission marker");
requireIncludes(route, "backup.operator.dry_run", "API dry-run permission");
requireIncludes(route, "permissions.manage", "API fallback permission");
requireIncludes(route, "worker_call: false", "API worker_call false");
requireIncludes(route, "production_backup: false", "API production_backup false");
requireIncludes(route, "storage_upload: false", "API storage_upload false");
requireIncludes(route, "restore: false", "API restore false");

requireIncludes(page, "BACKUP_OPERATOR_UI_PERMISSION_GUARD", "UI page permission marker");
requireIncludes(page, "backup.operator.view", "UI view permission");
requireIncludes(page, "permissions.manage", "UI fallback permission");
requireIncludes(page, "missing_backup_operator_view", "UI denied reason");
requireIncludes(component, "BACKUP_OPERATOR_UI_PERMISSION_GUARD", "UI component permission marker");
requireIncludes(component, "Chỉ kiểm tra thử", "UI dry-run warning");
requireIncludes(component, "/api/admin/backups/service-dry-run", "UI local dry-run route");

requireIncludes(adapter, "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY", "adapter dry-run marker");
requireIncludes(adapter, "realBackupCreated: false", "adapter no real backup");
requireIncludes(adapter, "realStorageUpload: false", "adapter no real storage");
requireIncludes(adapter, "restoreExecuted: false", "adapter no restore");
requireIncludes(adapter, "workerCalled: false", "adapter no worker call");

requireIncludes(packageJsonText, "\"smoke:backup-operator:permission-guard\"", "permission smoke package script");
requireIncludes(packageJsonText, "\"check:backup-operator-permission-guardrails\"", "permission guardrail package script");
requireIncludes(packageJsonText, "\"check:backup-operator-ui-permission-guard\"", "UI permission package script");
requireIncludes(packageJsonText, "\"check:backup-operator-api-permission-guard\"", "API permission package script");

if (failures.length > 0) {
  for (const failure of failures) log(`FAIL ${failure}`);
  process.exit(1);
}

log("API permission guard: PASS");
log("UI permission guard: PASS");
log("Dry-run boundary: PASS");
log("Network execution: SKIPPED");
log("Result: PASS");
