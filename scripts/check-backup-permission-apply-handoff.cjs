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

const doc = readFile("docs/92_BACKUP_PERMISSION_APPLY_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Phase 88-92 Summary",
  "## Migration Apply Status",
  "## Permission Verification Status",
  "## Runtime Smoke Status",
  "## Fallback Removal Readiness Status",
  "## What Changed in DB",
  "## What Did Not Change in Runtime",
  "## What Is Still Blocked",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "OWNER_CONFIRMED_APPLIED",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "PARTIAL_LOCAL_STATIC_ONLY",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "Fallback `permissions.manage` still remains",
  "Execute/restore runtime still not enabled",
  "No deploy",
  "No push",
  "Backup worker not called",
  "No production backup/restore/storage operation",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(doc, pattern, `possible hardcoded credential ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-apply-handoff"] !==
    "node scripts/check-backup-permission-apply-handoff.cjs"
  ) {
    failures.push("package missing backup permission apply handoff checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission apply handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission apply handoff check passed.");
