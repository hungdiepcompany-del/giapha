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

const doc = readFile("docs/74_BACKUP_PERMISSION_SQL_STATIC_SAFETY_CHECK.md");
const sqlPath = "scripts/backup-permission-sql-candidate.sql.draft";
const sql = readFile(sqlPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## SQL Static Safety Goal",
  "## Candidate Path",
  "## Forbidden Patterns",
  "## Required Markers",
  "## Idempotency Expectations",
  "## No-Run Policy",
  "## Failure Handling",
  "## Phase 74 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_SQL_CANDIDATE_ONLY",
  "DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
]) {
  requireIncludes(sql, token, `SQL token ${token}`);
}

const hasIdempotency =
  /\bon\s+conflict\b/i.test(sql) ||
  /\bwhere\s+not\s+exists\b/i.test(sql) ||
  /idempotency\s+.*review/i.test(sql);

if (!hasIdempotency) {
  failures.push("SQL candidate missing idempotency concept");
}

for (const pattern of [
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[\s\S]*\bdrop\b/i,
  /\bcreate\s+extension\b/i,
  /\bgrant\s+all\b/i,
  /\brevoke\s+all\b/i,
  /\bsecurity\s+definer\b/i,
  /\bhttps?:\/\//i,
  /\bhttp\b/i,
  /\bhttps\b/i,
  /\bservice_role\b/i,
  /\banon\s+key\b/i,
  /\bjwt\s+secret\b/i,
]) {
  rejectPattern(sql, pattern, `SQL safety pattern ${pattern}`);
}

if (sqlPath.includes("supabase/migrations/") || sqlPath.includes("supabase\\migrations\\")) {
  failures.push("SQL candidate must not live in supabase/migrations");
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-sql-static-safety"] !==
    "node scripts/check-backup-permission-sql-static-safety.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-sql-static-safety script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission SQL static safety check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission SQL static safety check passed.");
