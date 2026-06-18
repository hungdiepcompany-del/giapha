const fs = require("node:fs");
const path = require("node:path");

const marker = "BACKUP_PERMISSION_SEED_CANDIDATE_SMOKE_ONLY";
const root = process.cwd();

const sqlPath = "scripts/backup-permission-sql-candidate.sql.draft";
const dryRunPath = "scripts/backup-permission-seed-dry-run.cjs";
const permissions = [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
];

function readRequired(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, content: "", error: `missing ${relativePath}` };
  }
  return { ok: true, content: fs.readFileSync(absolutePath, "utf8"), error: null };
}

const sql = readRequired(sqlPath);
const dryRun = readRequired(dryRunPath);
const failures = [];

if (!sql.ok) failures.push(sql.error);
if (!dryRun.ok) failures.push(dryRun.error);

for (const permission of permissions) {
  if (!sql.content.includes(permission)) failures.push(`SQL candidate missing ${permission}`);
  if (!dryRun.content.includes(permission)) failures.push(`seed dry-run missing ${permission}`);
}

for (const token of [
  "BACKUP_PERMISSION_SQL_CANDIDATE_ONLY",
  "DO_NOT_RUN_ON_PRODUCTION_WITHOUT_OWNER_APPROVAL",
]) {
  if (!sql.content.includes(token)) failures.push(`SQL candidate missing ${token}`);
}

const summary = {
  marker,
  ok: failures.length === 0,
  sql_candidate: sqlPath,
  seed_dry_run: dryRunPath,
  permissions,
  db_call: false,
  network_call: false,
  file_mutation: false,
  failures,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
