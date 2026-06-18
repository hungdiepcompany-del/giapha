const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/83_BACKUP_PERMISSION_MIGRATION_EXECUTION_RUNBOOK.md";

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
  "## Canonical Migration Directory",
  "## Migration File Path Correction",
  "## Migration File Baseline",
  "## Execution Runbook Goal",
  "## Required Owner Approval",
  "## Required DB Backup/Snapshot",
  "## Required Pre-Apply Checks",
  "## Manual Apply Options",
  "## CLI Apply Command Placeholders",
  "## Supabase Dashboard Apply Option",
  "## Post-Apply Verification",
  "## Rollback Notes",
  "## No-Run Policy",
  "## Phase 83 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "supabase/migrations/20260618_0007_backup_operator_permissions.sql",
  "owner approval",
  "DB backup/snapshot",
  "post-apply verification",
  "rollback",
  "Phase 83 does not run migration",
  "supabase migration up",
  "supabase db push",
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
    scripts["check:backup-permission-migration-canonical-path"] !==
    "node scripts/check-backup-permission-migration-canonical-path.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-migration-canonical-path script");
  }
  if (
    scripts["check:backup-permission-migration-execution-runbook"] !==
    "node scripts/check-backup-permission-migration-execution-runbook.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-migration-execution-runbook script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission migration execution runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission migration execution runbook check passed.");
