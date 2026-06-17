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

const doc = readFile("docs/45_BACKUP_SERVICE_WORKER_POST_DEPLOY_SMOKE_PLAN.md");
const smokeScript = readFile("scripts/smoke-backup-service-worker-post-deploy.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Post-Deploy Smoke Goal",
  "## Smoke Env Placeholders",
  "## Health Smoke",
  "## Internal Dry-Run Smoke",
  "## Fixture Verify Smoke",
  "## Safe Skip Behavior",
  "## No-Mutation Policy",
  "## Secret Logging Policy",
  "## Failure Handling",
  "## Phase 45 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_SERVICE_SMOKE_BASE_URL",
  "BACKUP_SERVICE_SMOKE_TOKEN",
  "SKIPPED because BACKUP_SERVICE_SMOKE_BASE_URL is not set",
  "No network call unless `BACKUP_SERVICE_SMOKE_BASE_URL` is explicit",
  "No token logging",
  "No production backup",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "POST_DEPLOY_SMOKE_ONLY",
  "BACKUP_SERVICE_SMOKE_BASE_URL",
  "BACKUP_SERVICE_SMOKE_TOKEN",
  "SKIPPED because BACKUP_SERVICE_SMOKE_BASE_URL is not set",
  "SKIPPED internal endpoints because BACKUP_SERVICE_SMOKE_TOKEN is not set",
  "GET /health",
  "POST /internal/backup/dry-run",
  "POST /internal/backup/fixture-verify",
  "realBackupCreated: false",
  "realStorageUpload: false",
  "restoreExecuted: false",
]) {
  requireIncludes(smokeScript, token, `smoke script ${token}`);
}

for (const forbidden of [
  ".env.local",
  ".dev.vars",
  "dotenv",
  "readFileSync",
  "console.log(token",
  "write(token",
  "realBackupCreated: true",
  "realStorageUpload: true",
  "restoreExecuted: true",
]) {
  rejectIncludes(smokeScript, forbidden, `smoke script ${forbidden}`);
}

if (/https?:\/\/[A-Za-z0-9.-]/.test(smokeScript)) {
  failures.push("smoke script must not hardcode a URL");
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-post-deploy-smoke-plan"] !== "node scripts/check-backup-service-worker-post-deploy-smoke-plan.cjs") {
    failures.push("package.json missing check:backup-service-worker-post-deploy-smoke-plan script");
  }
  if (scripts["smoke:backup-service-worker:post-deploy"] !== "node scripts/smoke-backup-service-worker-post-deploy.cjs") {
    failures.push("package.json missing smoke:backup-service-worker:post-deploy script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker post-deploy smoke plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker post-deploy smoke plan check passed.");
