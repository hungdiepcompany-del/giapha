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

const doc = readFile("docs/42_WORKER_SPLIT_BACKUP_READINESS_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Phase 37-42 Summary",
  "## Repository Hygiene Status",
  "## Backup Service Worker Status",
  "## Service Files",
  "## Worker Endpoints",
  "## Checks Available",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Deployment Boundary",
  "## Secret Boundary",
  "## Production Backup Boundary",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "services/backup-service",
  "GET /health",
  "POST /internal/backup/dry-run",
  "POST /internal/backup/fixture-verify",
  "Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN",
  "npm run check:backup-service-worker-boundary-design",
  "npm run check:backup-service-worker-scaffold",
  "npm run check:backup-service-worker-local-contract",
  "npm run smoke:backup-service-worker:contract",
  "npm run check:backup-service-worker-integration-readiness",
  "npm run check:worker-split-backup-readiness-handoff",
  "No deploy",
  "No production backup",
  "No real storage",
  "No main app integration yet",
  "No secret/key committed",
  "Phase 43 - Backup Service Worker Deploy Readiness Gate",
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
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*=\s*['"][^'"]+['"]/,
  /GOOGLE_CLIENT_SECRET\s*=\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*=\s*['"][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:worker-split-backup-readiness-handoff"] !== "node scripts/check-worker-split-backup-readiness-handoff.cjs") {
    failures.push("package.json missing check:worker-split-backup-readiness-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Worker split backup readiness handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Worker split backup readiness handoff check passed.");
