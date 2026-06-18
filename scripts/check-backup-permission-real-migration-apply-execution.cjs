const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/88_BACKUP_PERMISSION_REAL_MIGRATION_APPLY_EXECUTION.md";

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
  "## Owner Approval Scope",
  "## Migration File Path",
  "## Pre-Flight Checks Run",
  "## Apply Command Used",
  "## Apply Result",
  "## DB Mutation Result",
  "## Permissions Expected",
  "## Role Assignments Expected",
  "## What Was Not Changed",
  "## No-Deploy/No-Push Boundary",
  "## Fallback Still Remains",
  "## Execute/Restore Still Disabled",
  "## Phase 88 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "owner explicitly approved",
  "Supabase Dashboard SQL Editor - manual execution",
  "owner-confirmed successful execution",
  "DB mutation result: yes",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "No deploy was performed",
  "No push was performed",
  "fallback `permissions.manage` still remains",
  "runtime execute remains disabled",
  "runtime restore remains disabled",
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
    scripts["check:backup-permission-real-migration-apply-execution"] !==
    "node scripts/check-backup-permission-real-migration-apply-execution.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-real-migration-apply-execution script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission real migration apply execution check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission real migration apply execution check passed.");
