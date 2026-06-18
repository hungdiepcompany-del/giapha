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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/79_BACKUP_PERMISSION_MIGRATION_STATIC_VERIFICATION.md");
const migration = readFile(migrationPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Static Verification Goal",
  "## Migration File Under Review",
  "## Required Markers",
  "## Permission Verification",
  "## Role Assignment Verification",
  "## Forbidden Patterns",
  "## Idempotency Verification",
  "## No-Run Policy",
  "## Phase 79 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

if (!/^supabase\/migrations\/\d{8}_\d{4}_[a-z0-9_]+\.sql$/.test(migrationPath)) {
  failures.push("migration filename does not match YYYYMMDD_000N_name.sql pattern");
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

if (!/\bon\s+conflict\b/i.test(migration) && !/\bwhere\s+not\s+exists\b/i.test(migration)) {
  failures.push("migration missing idempotency concept");
}

for (const role of ["EDITOR", "CONTRIBUTOR", "FAMILY_VIEWER", "PUBLIC_VIEWER", "VIEWER", "ANONYMOUS", "PUBLIC"]) {
  if (new RegExp(`['"]${role}['"]\\s*,\\s*['"]backup\\.operator\\.`, "i").test(migration)) {
    failures.push(`forbidden backup permission assignment to ${role}`);
  }
}

for (const permission of ["view", "dry_run", "execute", "restore"]) {
  requireIncludes(migration, `('OWNER', 'backup.operator.${permission}')`, `OWNER backup.operator.${permission}`);
}

for (const permission of ["view", "dry_run"]) {
  requireIncludes(migration, `('ADMIN', 'backup.operator.${permission}')`, `ADMIN backup.operator.${permission}`);
}

for (const permission of ["execute", "restore"]) {
  if (migration.includes(`('ADMIN', 'backup.operator.${permission}')`)) {
    failures.push(`ADMIN must not receive backup.operator.${permission}`);
  }
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
  /executeBackup|restoreBackup|createBackup|storage_upload|worker_call/i,
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
    scripts["check:backup-permission-real-migration-static-verification"] !==
    "node scripts/check-backup-permission-real-migration-static-verification.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-real-migration-static-verification script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission real migration static verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission real migration static verification passed.");
