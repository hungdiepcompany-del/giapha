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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/75_BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE.md");
const smoke = readFile("scripts/smoke-backup-permission-seed-candidate.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Seed Candidate Smoke Goal",
  "## Inputs Checked",
  "## Permission Consistency",
  "## No-DB Policy",
  "## Expected Output",
  "## Limitations",
  "## Phase 75 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY",
  "scripts/backup-permission-sql-candidate.sql.draft",
  "scripts/backup-permission-seed-dry-run.cjs",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL",
  "db_call: false",
  "network_call: false",
  "file_mutation: false",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const pattern of [
  /process\.env/,
  /\.env\.local/,
  /\.dev\.vars/,
  /\bfetch\s*\(/,
  /\bcreateClient\b/,
  /\bsupabase\b/i,
  /\bexec\b|\bexecFile\b|\bspawn\b/,
  /\bwriteFile\b|\bappendFile\b|\bunlink\b|\brmSync\b|\brename\b/,
  /https?:\/\//i,
]) {
  rejectPattern(smoke, pattern, `smoke unsafe pattern ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["smoke:backup-permission:seed-candidate"] !==
    "node scripts/smoke-backup-permission-seed-candidate.cjs"
  ) {
    failures.push("package.json missing smoke:backup-permission:seed-candidate script");
  }
  if (
    scripts["check:backup-permission-seed-candidate-smoke"] !==
    "node scripts/check-backup-permission-seed-candidate-smoke.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-seed-candidate-smoke script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission seed candidate smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission seed candidate smoke check passed.");
