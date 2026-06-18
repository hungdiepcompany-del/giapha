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

const doc = readFile("docs/58_BACKUP_OPERATOR_API_DRY_RUN_ROUTE.md");
const route = readFile(routePath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## API Route Goal",
  "## Route Path",
  "## Dry-Run Response Envelope",
  "## Auth/Permission Boundary",
  "## No-Worker-Call Policy",
  "## No-Real-Backup Policy",
  "## Failure Handling",
  "## Phase 58 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  routePath,
  "/api/admin/backups/service-dry-run",
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "mode: \"dry_run\"",
  "worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
  "dry-run/operator contract route",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "backupServiceDryRun",
  "backupServiceHealth",
  "backupServiceFixtureVerify",
  "mode: \"dry_run\"",
  "worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
  "permission_boundary",
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
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-api-dry-run-route"] !== "node scripts/check-backup-operator-api-dry-run-route.cjs") {
    failures.push("package.json missing check:backup-operator-api-dry-run-route script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator API dry-run route check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator API dry-run route check passed.");
