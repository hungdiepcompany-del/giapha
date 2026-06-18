const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md");
const smoke = readFile("scripts/smoke-backup-permission-post-migration.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Post-Migration Smoke Goal",
  "## Smoke Env Placeholders",
  "## Safe Skip Behavior",
  "## API/UI Smoke Scope",
  "## Permission Expectations",
  "## No-Real-Backup Policy",
  "## Failure Handling",
  "## Phase 81 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_POST_MIGRATION_SMOKE_ONLY",
  "BACKUP_PERMISSION_SMOKE_BASE_URL",
  "BACKUP_PERMISSION_SMOKE_EXPECTED_USER",
  "SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set",
  "SKIPPED because BACKUP_PERMISSION_SMOKE_EXPECTED_USER is not set",
  "/api/admin/backups/service-dry-run",
  "/admin/backups",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
  "backup_worker_call: false",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const token of [
  "No-Real-Backup Policy",
  "production backup",
  "storage upload",
  "restore",
  "backup service worker call",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /\.env\.local/,
  /\.dev\.vars/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
  /executeBackup|restoreBackup|createBackup|uploadBackup|storageUpload/i,
  /BACKUP_SERVICE_INTERNAL_TOKEN/,
]) {
  rejectPattern(smoke, pattern, `smoke unsafe pattern ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["smoke:backup-permission:post-migration"] !==
    "node scripts/smoke-backup-permission-post-migration.cjs"
  ) {
    failures.push("package.json missing smoke:backup-permission:post-migration script");
  }
  if (
    scripts["check:backup-permission-post-migration-smoke-plan"] !==
    "node scripts/check-backup-permission-post-migration-smoke-plan.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-post-migration-smoke-plan script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission post-migration smoke plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission post-migration smoke plan check passed.");
