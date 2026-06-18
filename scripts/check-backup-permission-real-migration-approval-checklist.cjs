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

const doc = readFile("docs/76_BACKUP_PERMISSION_REAL_MIGRATION_APPROVAL_CHECKLIST.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Real Migration Approval Goal",
  "## Required Owner Approval",
  "## Required SQL Candidate Checks",
  "## Required Seed Dry-Run Checks",
  "## Required Backup Of Current DB",
  "## Required Rollback Plan",
  "## Required Production Window",
  "## Required Post-Migration Validation",
  "## Explicit No-Go Conditions",
  "## Phase 76 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "OWNER_APPROVAL_REQUIRED_BEFORE_BACKUP_PERMISSION_REAL_MIGRATION=true",
  "owner approval is missing",
  "SQL candidate has not been reviewed",
  "rollback plan is missing",
  "DB backup/snapshot is missing",
  "production window is unknown",
  "local checks have not passed",
  "permission assignment has not been confirmed",
  "fallback removal plan has not been confirmed",
  "execute/restore real activation boundary has not been confirmed",
  "No real migration in Phase 76",
  "Required Post-Migration Validation",
  "rollback plan",
  "DB backup/snapshot",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "supabase migration up",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "read secret value",
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in approval checklist: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-real-migration-approval-checklist"] !==
    "node scripts/check-backup-permission-real-migration-approval-checklist.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-real-migration-approval-checklist script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission real migration approval checklist check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission real migration approval checklist check passed.");
