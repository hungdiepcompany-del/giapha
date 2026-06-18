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

const doc = readFile(
  "docs/95_BACKUP_OPERATOR_AUTHENTICATED_SMOKE_ENV_CONTRACT.md",
);
const smoke = readFile(
  "scripts/smoke-backup-permission-post-migration.cjs",
);
const checker = readFile(
  "scripts/check-backup-operator-authenticated-smoke-env-contract.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Authenticated Smoke Goal",
  "## Allowed Env Placeholders",
  "## Auth Material Handling",
  "## Safe Skip Behavior",
  "## API/UI Smoke Scope",
  "## No-Secret-Logging Policy",
  "## No-Real-Backup Policy",
  "## Phase 95 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_SMOKE_BASE_URL",
  "BACKUP_PERMISSION_SMOKE_EXPECTED_USER",
  "BACKUP_PERMISSION_SMOKE_AUTH_COOKIE",
  "BACKUP_PERMISSION_SMOKE_BEARER_TOKEN",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "does not read `.env.local`, `.dev.vars`",
  "does not print cookie/token values",
  "No direct backup service worker call",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_OPERATOR_AUTHENTICATED_SMOKE_SHELL_ONLY",
  "BACKUP_PERMISSION_SMOKE_BASE_URL",
  "BACKUP_PERMISSION_SMOKE_EXPECTED_USER",
  "BACKUP_PERMISSION_SMOKE_AUTH_COOKIE",
  "BACKUP_PERMISSION_SMOKE_BEARER_TOKEN",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  'auth_method: authCookie ? "cookie" : "bearer"',
  '"/api/admin/backups/service-dry-run"',
  '"/admin/backups"',
  "auth_material_printed: false",
  "backup_worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const pattern of [
  /node:fs/,
  /readFileSync/,
  /\.env\.local/,
  /\.dev\.vars/,
  /console\.(?:log|error)\s*\([^)]*(?:authCookie|bearerToken|baseUrl)/,
  /reason:\s*error\.(?:message|stack)/,
  /BACKUP_SERVICE_INTERNAL_TOKEN/,
  /backup-service\.[^/\s]+\/internal/i,
  /executeBackup|restoreBackup|createBackup|uploadBackup|storageUpload/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  rejectPattern(smoke, pattern, `unsafe smoke pattern ${pattern}`);
}

for (const pattern of [
  /\bfetch\s*\(/,
  /\bprocess\.env\b/,
  /\.(?:insert|update|delete|upsert|rpc)\s*\(/,
]) {
  rejectPattern(checker, pattern, `unsafe checker behavior ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-operator-authenticated-smoke-env-contract"] !==
    "node scripts/check-backup-operator-authenticated-smoke-env-contract.cjs"
  ) {
    failures.push("package missing Phase 95 checker");
  }
  if (
    scripts["smoke:backup-permission:post-migration"] !==
    "node scripts/smoke-backup-permission-post-migration.cjs"
  ) {
    failures.push("package missing authenticated smoke command");
  }
}

if (failures.length > 0) {
  console.error("Backup operator authenticated smoke env contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator authenticated smoke env contract check passed.");
