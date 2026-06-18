const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/84_BACKUP_PERMISSION_PRE_APPLY_VERIFICATION_CHECKLIST.md";

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
  "## Pre-Apply Checklist Goal",
  "## Migration File Verification",
  "## Static Safety Verification",
  "## DB Backup/Snapshot Verification",
  "## Environment Identity Verification",
  "## Owner Approval Verification",
  "## Permission Assignment Verification",
  "## Fallback Behavior Verification",
  "## No-Go Conditions",
  "## No-Apply Policy",
  "## Phase 84 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "NO-GO if:",
  "owner approval missing",
  "DB backup/snapshot missing",
  "wrong Supabase project",
  "migration file changed after review",
  "static checks not passing",
  "canonical path check not passing",
  "rollback owner missing",
  "post-migration smoke owner missing",
  "expected roles not confirmed",
  "fallback removal plan not understood",
  "migration file verification",
  "DB backup/snapshot verification",
  "environment identity verification",
  "owner approval verification",
  "Phase 84 does not run migration",
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
    scripts["check:backup-permission-pre-apply-verification-checklist"] !==
    "node scripts/check-backup-permission-pre-apply-verification-checklist.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-pre-apply-verification-checklist script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission pre-apply verification checklist check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission pre-apply verification checklist check passed.");
