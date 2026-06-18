const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const migrationRelativePath =
  "db/migrations/20260618_0007_backup_operator_permissions.sql";

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

const doc = readFile("docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md");
const migration = readFile(migrationRelativePath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Permission Baseline",
  "## Real Migration File Goal",
  "## Migration File Path",
  "## Owner Approval Scope",
  "## Permission List",
  "## Role Assignment Behavior",
  "## Idempotency Strategy",
  "## Destructive SQL Ban",
  "## No-Run Policy",
  "## Validation",
  "## Phase 78 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

if (!/^db\/migrations\/\d{8}_\d{4}_backup_operator_permissions\.sql$/.test(migrationRelativePath)) {
  failures.push("migration file path does not match expected pattern");
}

for (const token of [
  "BACKUP_PERMISSION_REAL_MIGRATION_FILE",
  "OWNER_APPROVED_FILE_CREATION_ONLY",
  "DO_NOT_RUN_WITHOUT_SEPARATE_OWNER_APPROVAL",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
]) {
  requireIncludes(migration, token, `migration token ${token}`);
}

const hasIdempotency =
  /\bon\s+conflict\b/i.test(migration) ||
  /\bwhere\s+not\s+exists\b/i.test(migration);
if (!hasIdempotency) failures.push("migration missing idempotency concept");

for (const pattern of [
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[\s\S]*\bdrop\b/i,
  /\brevoke\s+all\b/i,
  /\bgrant\s+all\b/i,
  /\bsecurity\s+definer\b/i,
  /\bcreate\s+extension\b/i,
  /\bhttps?:\/\//i,
  /\bhttp\b/i,
  /\bhttps\b/i,
  /\bservice_role\b/i,
  /\banon\s+key\b/i,
  /\bjwt\s+secret\b/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(migration, pattern, `migration unsafe pattern ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-real-migration-file"] !==
    "node scripts/check-backup-permission-real-migration-file.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-real-migration-file script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission real migration file check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission real migration file check passed.");
