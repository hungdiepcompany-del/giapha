const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const docPath = "docs/85_BACKUP_PERMISSION_ROLLBACK_DRILL_PLAN.md";

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

function requireIncludesIgnoreCase(content, token, label = token) {
  if (!content.toLowerCase().includes(token.toLowerCase())) {
    failures.push(`missing ${label}`);
  }
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Canonical Migration Path",
  "## Rollback Drill Goal",
  "## Failure Scenarios",
  "## Detection Signals",
  "## Immediate Safe Action",
  "## Rollback Options",
  "## Restore-From-Snapshot Option",
  "## Permission Assignment Rollback Option",
  "## Fallback permissions.manage Behavior",
  "## Communication Checklist",
  "## No-Rollback-Execution Policy",
  "## Phase 85 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "db/migrations/20260618_0007_backup_operator_permissions.sql",
  "rollback options",
  "restore-from-snapshot",
  "owner/admin mat quyen xem `/admin/backups`",
  "API dry-run tra 403 nham",
  "permission seed thieu `backup.operator.view`",
  "permission seed thieu `backup.operator.dry_run`",
  "role assignment sai",
  "migration applied to wrong project",
  "fallback removal duoc thuc hien qua som",
  "permissions.manage",
  "Phase 85 does not run rollback",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(doc, pattern, `possible hardcoded secret ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-rollback-drill-plan"] !==
    "node scripts/check-backup-permission-rollback-drill-plan.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-rollback-drill-plan script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission rollback drill plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission rollback drill plan check passed.");
