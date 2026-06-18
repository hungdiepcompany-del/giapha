const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/87_BACKUP_PERMISSION_EXECUTION_READINESS_HANDOFF.md";

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
  "## Current Production Baseline",
  "## Canonical Migration Path",
  "## Migration File Status",
  "## Phase 83-87 Summary",
  "## Execution Runbook Status",
  "## Pre-Apply Checklist Status",
  "## Rollback Drill Status",
  "## Approval Gate Status",
  "## What Is Ready",
  "## What Is Still Blocked",
  "## Required Owner Approval Before Real Apply",
  "## Required DB Backup/Snapshot",
  "## Required Post-Apply Smoke",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "Phase 83-87",
  "Migration file exists in `db/migrations/`",
  "Execution runbook status",
  "Pre-apply checklist status",
  "Rollback drill status",
  "Approval gate status",
  "Owner approval is still required before apply",
  "Migration has not been run",
  "No DB mutation",
  "Fallback `permissions.manage` still remains",
  "Wrong old path `supabase/migrations/20260618_0007_backup_operator_permissions.sql` no longer exists",
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
    scripts["check:backup-permission-execution-readiness-handoff"] !==
    "node scripts/check-backup-permission-execution-readiness-handoff.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-execution-readiness-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission execution readiness handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission execution readiness handoff check passed.");
