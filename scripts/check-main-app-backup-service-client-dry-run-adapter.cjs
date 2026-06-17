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

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/53_MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ADAPTER.md");
const adapter = readFile("server/services/backup-service-client.ts");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Main App Client Goal",
  "## Dry-Run Adapter Behavior",
  "## Disabled Network Policy",
  "## Future Env Placeholders",
  "## Request Envelope",
  "## Response Envelope",
  "## Error Mapping",
  "## Secret Safety",
  "## Phase 53 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY",
  "health",
  "dryRun",
  "fixtureVerify",
  "BackupServiceClientEnvelope",
  "backup_service_network_disabled",
  "BACKUP_SERVICE_BASE_URL",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
]) {
  requireIncludes(adapter, token, `adapter ${token}`);
}

for (const forbidden of [
  "fetch(\"http",
  "fetch('http",
  "https://",
  ".env.local",
  ".dev.vars",
  "createClient",
  "@supabase",
  "supabase",
  "storage.from",
  "restoreExecuted: true",
  "realBackupCreated: true",
  "realStorageUpload: true",
]) {
  rejectIncludes(adapter, forbidden, `adapter ${forbidden}`);
}

for (const secretPattern of [
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_BASE_URL\s*[:=]\s*['"][^'"]+['"]/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(adapter)) failures.push(`possible hardcoded secret in adapter: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:main-app-backup-service-client-dry-run-adapter"] !== "node scripts/check-main-app-backup-service-client-dry-run-adapter.cjs") {
    failures.push("package.json missing check:main-app-backup-service-client-dry-run-adapter script");
  }
}

if (failures.length > 0) {
  console.error("Main app backup service client dry-run adapter check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Main app backup service client dry-run adapter check passed.");
