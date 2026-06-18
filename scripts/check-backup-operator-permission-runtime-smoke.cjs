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

function requireIncludesIgnoreCase(content, token, label = token) {
  if (!content.toLowerCase().includes(token.toLowerCase())) {
    failures.push(`missing ${label}`);
  }
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/90_BACKUP_OPERATOR_PERMISSION_RUNTIME_SMOKE.md");
const postMigrationSmoke = readFile(
  "scripts/smoke-backup-permission-post-migration.cjs",
);
const permissionGuardSmoke = readFile(
  "scripts/smoke-backup-operator-permission-guard.cjs",
);
const dryRunSmoke = readFile("scripts/smoke-backup-operator-dry-run.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Runtime Smoke Goal",
  "## Smoke Env Placeholders",
  "## API/UI Smoke Scope",
  "## Dry-Run Only Policy",
  "## No-Worker-Call Policy",
  "## No-Real-Backup Policy",
  "## Smoke Result",
  "## Failure Handling",
  "## Phase 90 Boundary",
  "## Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "SKIPPED_NO_EXPLICIT_ENV",
  "PASS_LOCAL_STATIC",
  "dry-run only",
  "No backup service worker was called",
  "did not create a production backup",
  "fallback `permissions.manage` still remains",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const token of [
  "SKIPPED because BACKUP_PERMISSION_SMOKE_BASE_URL is not set",
  "network_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
]) {
  requireIncludesIgnoreCase(
    postMigrationSmoke,
    token,
    `post-migration smoke token ${token}`,
  );
}

for (const [content, label] of [
  [permissionGuardSmoke, "permission guard smoke"],
  [dryRunSmoke, "dry-run smoke"],
]) {
  requireIncludesIgnoreCase(content, "Network execution: SKIPPED", `${label} safe skip`);
  requireIncludesIgnoreCase(content, "Result: PASS", `${label} result`);
}

for (const content of [postMigrationSmoke, permissionGuardSmoke, dryRunSmoke]) {
  for (const pattern of [
    /Bearer\s+[A-Za-z0-9._-]{20,}/,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /secret\s*[:=]\s*['"][^'"]+['"]/i,
    /token\s*[:=]\s*['"][^'"]+['"]/i,
  ]) {
    rejectPattern(content, pattern, `possible hardcoded credential ${pattern}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-operator-permission-runtime-smoke"] !==
    "node scripts/check-backup-operator-permission-runtime-smoke.cjs"
  ) {
    failures.push("package missing runtime smoke checker");
  }
}

if (failures.length > 0) {
  console.error("Backup operator permission runtime smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator permission runtime smoke check passed.");
