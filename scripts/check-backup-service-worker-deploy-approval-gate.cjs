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

const doc = readFile("docs/51_BACKUP_SERVICE_WORKER_DEPLOY_APPROVAL_GATE.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Deploy Approval Goal",
  "## Approval Checklist",
  "## Required Validation Before Approval",
  "## Required Secrets Before Approval",
  "## Required Rollback Owner",
  "## Required Smoke Owner",
  "## Required Deployment Window",
  "## Explicit Owner Approval Statement",
  "## No-Go Conditions",
  "## Phase 51 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "OWNER_APPROVAL_REQUIRED_BEFORE_REAL_DEPLOY=true",
  "Owner confirms:",
  "deploy target",
  "worker name",
  "secret readiness",
  "smoke readiness",
  "rollback plan",
  "no production backup will run",
  "No-Go Conditions",
  "owner approval is missing",
  "No deploy",
  "No secret read",
  "No API call",
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
  if (scripts["check:backup-service-worker-deploy-approval-gate"] !== "node scripts/check-backup-service-worker-deploy-approval-gate.cjs") {
    failures.push("package.json missing check:backup-service-worker-deploy-approval-gate script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker deploy approval gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker deploy approval gate check passed.");
