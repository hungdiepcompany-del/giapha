const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const canonicalPath = "db/migrations/20260618_0007_backup_operator_permissions.sql";
const wrongOldPath = "supabase/migrations/20260618_0007_backup_operator_permissions.sql";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const canonicalAbsolutePath = path.join(root, canonicalPath);
const wrongOldAbsolutePath = path.join(root, wrongOldPath);

if (!fs.existsSync(canonicalAbsolutePath)) {
  failures.push(`missing canonical migration ${canonicalPath}`);
}

if (fs.existsSync(wrongOldAbsolutePath)) {
  failures.push(`wrong old migration path still exists: ${wrongOldPath}`);
}

const migration = readFile(canonicalPath);

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

for (const pattern of [
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+table\b[\s\S]*\bdrop\b/i,
  /\bgrant\s+all\b/i,
  /\brevoke\s+all\b/i,
  /\bsecurity\s+definer\b/i,
  /\bcreate\s+extension\b/i,
  /\bhttps?:\/\//i,
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

const filesThatMustUseCanonicalPath = [
  "docs/78_BACKUP_PERMISSION_REAL_MIGRATION_FILE_IMPLEMENTATION.md",
  "docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md",
  "docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md",
  "docs/81_BACKUP_PERMISSION_POST_MIGRATION_SMOKE_PLAN.md",
  "docs/82_BACKUP_PERMISSION_REAL_MIGRATION_HANDOFF.md",
  "scripts/check-backup-permission-real-migration-file.cjs",
  "scripts/check-backup-permission-real-migration-static-verification.cjs",
  "scripts/check-backup-permission-real-migration-handoff.cjs",
];

for (const relativePath of filesThatMustUseCanonicalPath) {
  const content = readFile(relativePath);
  if (content.includes(wrongOldPath)) {
    failures.push(`${relativePath} still references wrong old migration path`);
  }
}

if (failures.length > 0) {
  console.error("Backup permission migration canonical path check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission migration canonical path check passed.");
