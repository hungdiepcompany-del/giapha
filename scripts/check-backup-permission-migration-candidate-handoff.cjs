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

const doc = readFile("docs/77_BACKUP_PERMISSION_MIGRATION_CANDIDATE_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Operator Permission Current Status",
  "## Phase 73-77 Summary",
  "## SQL Candidate Status",
  "## Static Safety Status",
  "## Seed Candidate Smoke Status",
  "## Approval Checklist Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Required Future Real Migration",
  "## Required Future DB Backup/Snapshot",
  "## Required Rollback Plan",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Phase 73-77",
  "SQL candidate status",
  "Static safety status",
  "Seed candidate smoke status",
  "Approval checklist status",
  "SQL candidate is not real migration",
  "No file in `supabase/migrations/`",
  "No migration/schema in Phase 73-77",
  "No DB mutation",
  "No real worker call",
  "No deploy",
  "No production backup",
  "No real storage",
  "No secret committed",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "still not enabled",
  "permissions.manage",
  "OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in migration candidate handoff: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-migration-candidate-handoff"] !==
    "node scripts/check-backup-permission-migration-candidate-handoff.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-migration-candidate-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission migration candidate handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission migration candidate handoff check passed.");
