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

const doc = readFile("docs/52_BACKUP_SERVICE_WORKER_PRE_DEPLOY_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Service Current Status",
  "## Phase 48-52 Summary",
  "## Workflow Readiness Status",
  "## Manual Deploy Runbook Status",
  "## Secrets Preflight Status",
  "## Approval Gate Status",
  "## Required Commands",
  "## Required Secrets",
  "## Required Owner Approval",
  "## What Is Ready",
  "## What Is Still Blocked",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Phase 48-52 Summary",
  "services/backup-service",
  "/health",
  "/internal/backup/dry-run",
  "/internal/backup/fixture-verify",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_SMOKE_BASE_URL",
  "BACKUP_SERVICE_SMOKE_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true",
  "npm run check:backup-service-worker-github-actions-deploy-readiness",
  "npm run check:backup-service-worker-manual-deploy-runbook",
  "npm run check:backup-service-worker-secrets-preflight-checklist",
  "npm run check:backup-service-worker-deploy-approval-gate",
  "npm run check:backup-service-worker-pre-deploy-handoff",
  "npm run smoke:backup-service-worker:post-deploy",
  "no deploy yet",
  "no production backup",
  "no real storage",
  "no secret committed",
  "no main app integration yet",
]) {
  requireIncludes(doc, token);
}

for (const secretPattern of [
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_SMOKE_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_ACCOUNT_ID\s*[:=]\s*['"][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-pre-deploy-handoff"] !== "node scripts/check-backup-service-worker-pre-deploy-handoff.cjs") {
    failures.push("package.json missing check:backup-service-worker-pre-deploy-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker pre-deploy handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker pre-deploy handoff check passed.");
