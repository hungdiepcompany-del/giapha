const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/86_BACKUP_PERMISSION_APPLY_APPROVAL_GATE.md";

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

function requireIncludesIgnoreCase(content, token, label = token) {
  if (!content.toLowerCase().includes(token.toLowerCase())) {
    failures.push(`missing ${label}`);
  }
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Canonical Migration Path",
  "## Apply Approval Goal",
  "## Required Owner Approval Statement",
  "## Required Supabase Project Confirmation",
  "## Required Backup/Snapshot Confirmation",
  "## Required Local Validation",
  "## Required Rollback Owner",
  "## Required Smoke Owner",
  "## Required Apply Window",
  "## Explicit No-Go Conditions",
  "## No-Apply Policy",
  "## Phase 86 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "OWNER_APPROVAL_REQUIRED_BEFORE_APPLYING_BACKUP_PERMISSION_MIGRATION=true",
  "Supabase project confirmation",
  "backup/snapshot confirmation",
  "rollback owner",
  "smoke owner",
  "apply window",
  "NO-GO if:",
  "Phase 86 does not run migration",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(doc, pattern, `possible hardcoded secret ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-apply-approval-gate"] !==
    "node scripts/check-backup-permission-apply-approval-gate.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-apply-approval-gate script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission apply approval gate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission apply approval gate check passed.");
