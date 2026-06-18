const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const pagePath = "app/(admin)/admin/backups/page.tsx";
const componentPath = "components/admin/backup-operator-dry-run-panel.tsx";

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

const doc = readFile("docs/65_BACKUP_OPERATOR_UI_PERMISSION_GUARD.md");
const page = readFile(pagePath);
const component = readFile(componentPath);
const packageJson = readJson("package.json");
const uiSource = `${page}\n${component}`;

for (const section of [
  "## Production Baseline",
  "## UI Baseline",
  "## UI Permission Guard Goal",
  "## Existing Admin Guard Pattern Used",
  "## Required Permission",
  "## Fallback Behavior",
  "## Dry-Run Warning Policy",
  "## No-Real-Backup Policy",
  "## Phase 65 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  pagePath,
  componentPath,
  "/admin/backups",
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD",
  "backup.operator.view",
  "permissions.manage",
  "Dry-run only",
  "/api/admin/backups/service-dry-run",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD",
  "getPermissionContext",
  "backup.operator.view",
  "permissions.manage",
  "missing_backup_operator_view",
  "BackupOperatorDryRunPanel",
  "Dry-run only",
  "No production backup",
  "No storage upload",
  "No restore",
  "No real worker call",
  "/api/admin/backups/service-dry-run",
]) {
  requireIncludes(uiSource, token, `UI token ${token}`);
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
  "supabase.",
  "workers.dev",
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
  rejectIncludes(uiSource, forbidden, `UI ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(uiSource)) failures.push(`possible hardcoded secret in UI source: ${secretPattern}`);
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-ui-permission-guard"] !== "node scripts/check-backup-operator-ui-permission-guard.cjs") {
    failures.push("package.json missing check:backup-operator-ui-permission-guard script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator UI permission guard check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator UI permission guard check passed.");
