const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const marker = "BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY";
const failures = [];

function log(line) {
  console.log(`[smoke:backup-operator:dry-run] ${line}`);
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
const guardrail = readRequired("scripts/check-backup-operator-ui-guardrails.cjs");
const packageJsonText = readRequired("package.json");

requireIncludes(route, "BACKUP_OPERATOR_API_DRY_RUN_ONLY", "API dry-run marker");
requireIncludes(route, "worker_call: false", "API worker_call false");
requireIncludes(route, "production_backup: false", "API production_backup false");
requireIncludes(route, "storage_upload: false", "API storage_upload false");
requireIncludes(route, "restore: false", "API restore false");
requireIncludes(page, "BackupOperatorDryRunPanel", "admin backups page panel");
requireIncludes(component, "Chỉ kiểm tra thử", "UI dry-run warning");
requireIncludes(component, "Không tạo bản sao lưu production", "UI no production backup warning");
requireIncludes(component, "Không tải lên storage", "UI no storage upload warning");
requireIncludes(component, "Không phục hồi dữ liệu", "UI no restore warning");
requireIncludes(component, "Không gọi Worker thật", "UI no real worker call warning");
requireIncludes(component, "/api/admin/backups/service-dry-run", "UI local dry-run route");
requireIncludes(guardrail, "Backup operator UI guardrail check passed", "guardrail checker");
requireIncludes(packageJsonText, "\"check:backup-operator-ui-guardrails\"", "guardrail package script");
requireIncludes(packageJsonText, "\"check:backup-operator-ui-dry-run-panel\"", "UI package script");
requireIncludes(packageJsonText, "\"check:backup-operator-api-dry-run-route\"", "API package script");

if (failures.length > 0) {
  for (const failure of failures) log(`FAIL ${failure}`);
  process.exit(1);
}

log("API route: PASS");
log("UI page: PASS");
log("UI component: PASS");
log("Guardrails: PASS");
log("Network execution: SKIPPED");
log("Result: PASS");
