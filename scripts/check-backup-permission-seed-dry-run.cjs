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

const doc = readFile("docs/69_BACKUP_PERMISSION_SEED_DRY_RUN_CHECKER.md");
const dryRunScript = readFile("scripts/backup-permission-seed-dry-run.cjs");
const checkScript = readFile("scripts/check-backup-permission-seed-dry-run.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Seed Dry-Run Goal",
  "## Dry-Run Script Behavior",
  "## Expected Permissions",
  "## Expected Role Assignments",
  "## No-DB Policy",
  "## No-Migration Policy",
  "## Expected Output",
  "## Failure Handling",
  "## Phase 69 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_SEED_DRY_RUN_ONLY",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "dry_run",
  "would_insert",
  "would_assign",
  "No-DB Policy",
  "No-Migration Policy",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_PERMISSION_SEED_DRY_RUN_ONLY",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "dry_run",
  "would_insert",
  "would_assign",
]) {
  requireIncludes(dryRunScript, token, `dry-run script token ${token}`);
}

for (const token of [
  "OWNER",
  "ADMIN",
  "EDITOR",
  "CONTRIBUTOR",
  "FAMILY_VIEWER",
  "PUBLIC_VIEWER",
  "migration_written: false",
  "db_mutation: false",
  "network_call: false",
]) {
  requireIncludes(dryRunScript, token, `dry-run script token ${token}`);
}

for (const forbidden of [
  "@supabase",
  "createClient",
  "process.env",
  ".env.local",
  ".dev.vars",
  "fetch(",
  "http://",
  "https://",
  "pg.",
  "postgres",
  "supabase",
  "writeFile",
  "appendFile",
  "db/migrations",
]) {
  rejectIncludes(dryRunScript, forbidden, `dry-run script ${forbidden}`);
}

if (!checkScript.includes("BACKUP_PERMISSION_SEED_DRY_RUN_ONLY")) {
  failures.push("check script missing marker scan");
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(dryRunScript)) failures.push(`possible hardcoded secret in dry-run script: ${secretPattern}`);
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["backup:permission:seed:dry-run"] !== "node scripts/backup-permission-seed-dry-run.cjs") {
    failures.push("package.json missing backup:permission:seed:dry-run script");
  }
  if (scripts["check:backup-permission-seed-dry-run"] !== "node scripts/check-backup-permission-seed-dry-run.cjs") {
    failures.push("package.json missing check:backup-permission-seed-dry-run script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission seed dry-run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission seed dry-run check passed.");
