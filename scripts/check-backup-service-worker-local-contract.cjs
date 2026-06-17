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

const doc = readFile("docs/40_BACKUP_SERVICE_WORKER_LOCAL_CONTRACT_CHECKS.md");
const source = readFile("services/backup-service/src/index.ts");
const smoke = readFile("scripts/smoke-backup-service-worker-contract.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Local Contract Goal",
  "## Contract Checks",
  "## Auth Expectations",
  "## Response Envelope Expectations",
  "## Static Vs Runtime Smoke Limitation",
  "## No-Deploy Policy",
  "## PASS/FAIL Criteria",
  "## Phase 40 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "/health",
  "/internal/backup/dry-run",
  "/internal/backup/fixture-verify",
  "401",
  "Authorization",
  "Bearer",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_DRY_RUN_ONLY",
  "ok",
  "code",
  "message",
  "requestId",
]) {
  requireIncludes(source, token, `worker source ${token}`);
}

for (const forbidden of [
  "fetch(\"http",
  "fetch('http",
  "createClient",
  "googleapis",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_SECRET",
  "CLOUDFLARE_API_TOKEN",
  "wrangler deploy",
  ".env.local",
  ".dev.vars",
]) {
  rejectIncludes(source, forbidden, `worker source ${forbidden}`);
}

requireIncludes(smoke, "BACKUP_SERVICE_CONTRACT_SMOKE_ONLY", "smoke marker");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-local-contract"] !== "node scripts/check-backup-service-worker-local-contract.cjs") {
    failures.push("package.json missing check:backup-service-worker-local-contract script");
  }
  if (scripts["smoke:backup-service-worker:contract"] !== "node scripts/smoke-backup-service-worker-contract.cjs") {
    failures.push("package.json missing smoke:backup-service-worker:contract script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker local contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker local contract check passed.");
