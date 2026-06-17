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

const doc = readFile("docs/49_BACKUP_SERVICE_WORKER_MANUAL_DEPLOY_RUNBOOK.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Manual Deploy Goal",
  "## Pre-Deploy Checklist",
  "## Required Secrets",
  "## Required Vars",
  "## Local Validation Commands",
  "## Manual Deploy Command",
  "## Post-Deploy Smoke Commands",
  "## Rollback Procedure",
  "## Failure Handling",
  "## No-Production-Backup Policy",
  "## Phase 49 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "npx wrangler deploy",
  "npx wrangler secret put BACKUP_SERVICE_INTERNAL_TOKEN",
  "not to be run in Phase 49",
  "Owner explicitly approves",
  "Post-deploy smoke",
  "Rollback Procedure",
  "No-Production-Backup Policy",
  "No deploy",
  "No secret provisioning",
  "No production backup",
]) {
  requireIncludes(doc, token);
}

for (const secretPattern of [
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_ACCOUNT_ID\s*[:=]\s*['"][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-manual-deploy-runbook"] !== "node scripts/check-backup-service-worker-manual-deploy-runbook.cjs") {
    failures.push("package.json missing check:backup-service-worker-manual-deploy-runbook script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker manual deploy runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker manual deploy runbook check passed.");
