const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const migrationPath = "supabase/migrations/20260618_0007_backup_operator_permissions.sql";

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

const doc = readFile("docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md");
const migration = readFile(migrationPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Operator Permission Current Status",
  "## Phase 78-82 Summary",
  "## Real Migration File Status",
  "## Static Verification Status",
  "## Fallback Removal Plan Status",
  "## Post-Migration Smoke Plan Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Required Future Migration Execution Approval",
  "## Required Future DB Backup/Snapshot",
  "## Required Rollback Plan",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Phase 78-82",
  "Migration file exists in `supabase/migrations/`",
  "Migration has not been run",
  "No DB mutation",
  "fallback `permissions.manage` still remains",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "still not enabled",
  "future phase must get explicit owner approval",
  "No deploy",
  "No production backup",
  "No real storage",
  "No secret committed",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_PERMISSION_REAL_MIGRATION_FILE",
  "OWNER_APPROVED_FILE_CREATION_ONLY",
  "DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "supabase migration up",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "read secret value",
  "run production backup",
]) {
  rejectIncludes(doc, forbidden, `doc ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in real migration handoff: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-real-migration-handoff"] !==
    "node scripts/check-backup-permission-real-migration-handoff.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-real-migration-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission real migration handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission real migration handoff check passed.");
