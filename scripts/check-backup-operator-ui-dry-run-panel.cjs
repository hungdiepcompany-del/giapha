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

const doc = readFile("docs/59_BACKUP_OPERATOR_UI_DRY_RUN_PANEL.md");
const page = readFile(pagePath);
const component = readFile(componentPath);
const packageJson = readJson("package.json");
const combinedUi = `${page}\n${component}`;

for (const section of [
  "## Production Baseline",
  "## UI Goal",
  "## Route/Page Path",
  "## Dry-Run UX",
  "## Operator Warnings",
  "## No-Real-Backup Policy",
  "## No-Worker-Direct-Call Policy",
  "## Permission Boundary",
  "## Phase 59 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  pagePath,
  componentPath,
  "/admin/backups",
  "/api/admin/backups/service-dry-run",
  "Dry-run only",
  "No production backup",
  "No storage upload",
  "No restore",
  "No real worker call",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Chỉ kiểm tra thử",
  "Không tạo bản sao lưu production",
  "Không tải lên storage",
  "Không phục hồi dữ liệu",
  "Không gọi Worker thật",
  "Chạy kiểm tra thử",
  "/api/admin/backups/service-dry-run",
]) {
  requireIncludes(combinedUi, token, `ui token ${token}`);
}

for (const forbidden of [
  "workers.dev",
  "BACKUP_SERVICE_INTERNAL_TOKEN=",
  "CLOUDFLARE_API_TOKEN",
  "GOOGLE_CLIENT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "storage.from",
  ".upload(",
  "restoreExecuted: true",
  "realBackupCreated: true",
  "realStorageUpload: true",
  "production_backup: true",
  "storage_upload: true",
  "restore: true",
  ".env.local",
  ".dev.vars",
]) {
  rejectIncludes(combinedUi, forbidden, `ui ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(combinedUi)) failures.push(`possible hardcoded secret in UI: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-ui-dry-run-panel"] !== "node scripts/check-backup-operator-ui-dry-run-panel.cjs") {
    failures.push("package.json missing check:backup-operator-ui-dry-run-panel script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator UI dry-run panel check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator UI dry-run panel check passed.");
