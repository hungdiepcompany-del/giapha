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
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) {
    failures.push(`forbidden ${label}`);
  }
}

function scanForSecretPatterns(relativePath, content) {
  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

const doc = readFile("docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Approval Goal",
  "## Required Approvals",
  "## Storage Target Decision",
  "## Secret Handling Approval",
  "## Data Privacy Approval",
  "## Retention Approval",
  "## Restore Drill Approval",
  "## Operator Checklist",
  "## Pre-Production Backup Checklist",
  "## During-Backup Checklist",
  "## Post-Backup Verification Checklist",
  "## Incident/Rollback Checklist",
  "## Explicit No-Go Conditions",
  "## Phase 36 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "approval",
  "no-go",
  "No production backup in Phase 36",
  "No restore production",
  "No secret values are read or printed",
  "No deploy/push",
  "No storage mutation",
  "storage target is not selected",
  "owner backup approval is missing",
  "restore drill PASS is missing",
  "secret handling plan is missing",
  "privacy review is missing",
  "retention policy is missing",
  "rollback/incident owner is missing",
  "approval from the responsible person is missing",
  "Do not call production API/DB/network",
  "Do not hardcode secret/token/key values",
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
  rejectIncludes(doc, forbidden, `approval checklist ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:production-backup-approval-checklist"] !== "node scripts/check-production-backup-approval-checklist.cjs") {
    failures.push("package.json missing check:production-backup-approval-checklist script");
  }
}

scanForSecretPatterns("docs/36_PRODUCTION_BACKUP_APPROVAL_CHECKLIST.md", doc);

if (failures.length > 0) {
  console.error("Production backup approval checklist check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Production backup approval checklist check passed.");
