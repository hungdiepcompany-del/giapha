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

const docPath = "docs/73_BACKUP_PERMISSION_SQL_CANDIDATE_DRAFT.md";
const sqlPath = "scripts/backup-permission-sql-candidate.sql.draft";
const doc = readFile(docPath);
const sql = readFile(sqlPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Permission Baseline",
  "## SQL Candidate Goal",
  "## Candidate File Path",
  "## Permission List",
  "## Role Assignment Candidate",
  "## Idempotency Requirement",
  "## Destructive SQL Ban",
  "## Review Requirements",
  "## No-Real-Migration Policy",
  "## Phase 73 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_SQL_CANDIDATE_ONLY",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "on conflict",
]) {
  requireIncludes(sql, token, `SQL token ${token}`);
}

if (sqlPath.includes("supabase/migrations/") || sqlPath.includes("supabase\\migrations\\")) {
  failures.push("SQL candidate must not live in supabase/migrations");
}

for (const pattern of [
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[\s\S]*\bdrop\b/i,
]) {
  rejectPattern(sql, pattern, `destructive SQL pattern ${pattern}`);
}

for (const pattern of [
  /https?:\/\//i,
  /workers\.dev/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /service_role/i,
  /anon\s+key/i,
  /jwt\s+secret/i,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(sql, pattern, `secret/url pattern ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-sql-candidate-draft"] !==
    "node scripts/check-backup-permission-sql-candidate-draft.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-sql-candidate-draft script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission SQL candidate draft check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission SQL candidate draft check passed.");
