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

const doc = readFile("docs/47_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Service Current Status",
  "## Phase 43-47 Summary",
  "## Service Files",
  "## Endpoints",
  "## Auth/Env Placeholders",
  "## Deploy Readiness Status",
  "## Post-Deploy Smoke Readiness",
  "## Main App Binding Contract Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Required Approvals Before Deploy",
  "## Required Secrets Before Deploy",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "services/backup-service",
  "/health",
  "/internal/backup/dry-run",
  "/internal/backup/fixture-verify",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_SMOKE_BASE_URL",
  "BACKUP_SERVICE_SMOKE_TOKEN",
  "npm run check:backup-service-worker-deploy-readiness",
  "npm run check:backup-service-worker-env-secret-contract",
  "npm run check:backup-service-worker-post-deploy-smoke-plan",
  "npm run smoke:backup-service-worker:post-deploy",
  "npm run check:backup-service-worker-main-app-binding-contract",
  "npm run check:backup-service-worker-deploy-readiness-handoff",
  "No deploy",
  "No production backup",
  "No real storage",
  "No secret committed",
  "No main app integration yet",
  "Phase 48",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "googleapis",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `handoff doc ${forbidden}`);
}

for (const secretPattern of [
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /GOOGLE_CLIENT_SECRET\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_SMOKE_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-deploy-readiness-handoff"] !== "node scripts/check-backup-service-worker-deploy-readiness-handoff.cjs") {
    failures.push("package.json missing check:backup-service-worker-deploy-readiness-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker deploy readiness handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker deploy readiness handoff check passed.");
