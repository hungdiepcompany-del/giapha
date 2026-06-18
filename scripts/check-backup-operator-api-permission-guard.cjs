const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const routePath = "app/api/admin/backups/service-dry-run/route.ts";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = readFile(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/64_BACKUP_OPERATOR_API_PERMISSION_GUARD.md");
const route = readFile(routePath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## API Route Baseline",
  "## Permission Guard Goal",
  "## Existing Auth Pattern Used",
  "## Required Permission",
  "## Fallback Behavior",
  "## Fail-Closed Policy",
  "## No-Real-Backup Policy",
  "## No-Worker-Call Policy",
  "## Phase 64 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  routePath,
  "/api/admin/backups/service-dry-run",
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_API_PERMISSION_GUARD",
  "backup.operator.dry_run",
  "permissions.manage",
  "401",
  "403",
  "worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_API_PERMISSION_GUARD",
  "getPermissionContext",
  "backup.operator.dry_run",
  "permissions.manage",
  "status: 401",
  "status: 403",
  "permission_boundary",
  "server_side_permission_guard",
  "worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const forbidden of [
  "fetch(\"http",
  "fetch('http",
  "https://",
  ".env.local",
  ".dev.vars",
  "process.env",
  "createClient",
  "@supabase",
  "supabase",
  "storage.from",
  ".upload(",
  "restoreExecuted: true",
  "realBackupCreated: true",
  "realStorageUpload: true",
  "worker_call: true",
  "production_backup: true",
  "storage_upload: true",
  "restore: true",
]) {
  rejectIncludes(route, forbidden, `route ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(route)) failures.push(`possible hardcoded secret in route: ${secretPattern}`);
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-api-permission-guard"] !== "node scripts/check-backup-operator-api-permission-guard.cjs") {
    failures.push("package.json missing check:backup-operator-api-permission-guard script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator API permission guard check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator API permission guard check passed.");
