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

function listFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return [];
  }

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [relativePath];

  const files = [];
  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(child));
    } else {
      files.push(child);
    }
  }
  return files;
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/71_BACKUP_PERMISSION_ACTIVATION_GUARDRAILS.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Activation Guardrail Goal",
  "## Runtime Permission Boundary",
  "## Execute/Restore Not Enabled",
  "## Paths Scanned",
  "## Forbidden Patterns",
  "## Allowed Documentation Patterns",
  "## No-Real-Backup Policy",
  "## Phase 71 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "not enabled now",
  "No production backup",
  "No real worker call",
  "No storage upload",
  "No restore",
  "No hardcoded secret/token/key",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-activation-guardrails"] !==
    "node scripts/check-backup-permission-activation-guardrails.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-activation-guardrails script");
  }
}

const runtimeFiles = [
  ...listFiles("app/api/admin/backups"),
  ...listFiles("app/(admin)/admin/backups"),
  "components/admin/backup-operator-dry-run-panel.tsx",
  "server/services/backup-service-client.ts",
];

const dryRunSeed = readFile("scripts/backup-permission-seed-dry-run.cjs");

for (const file of runtimeFiles) {
  const content = readFile(file);
  rejectIncludes(content, "backup.operator.execute", `${file} backup.operator.execute`);
  rejectIncludes(content, "backup.operator.restore", `${file} backup.operator.restore`);
  rejectPattern(content, /worker_call\s*:\s*true/, `${file} worker_call true`);
  rejectPattern(content, /workerCalled\s*:\s*true/, `${file} workerCalled true`);
  rejectPattern(content, /production_backup\s*:\s*true/, `${file} production_backup true`);
  rejectPattern(content, /storage_upload\s*:\s*true/, `${file} storage_upload true`);
  rejectPattern(content, /restore\s*:\s*true/, `${file} restore true`);
  rejectPattern(content, /realBackupCreated\s*:\s*true/, `${file} realBackupCreated true`);
  rejectPattern(content, /realStorageUpload\s*:\s*true/, `${file} realStorageUpload true`);
  rejectPattern(content, /restoreExecuted\s*:\s*true/, `${file} restoreExecuted true`);
  rejectPattern(content, /\bfetch\s*\(\s*["']https?:\/\//, `${file} direct external fetch`);
  rejectPattern(content, /workers\.dev/i, `${file} worker URL`);
  rejectPattern(content, /R2Bucket|put\s*\(|upload\s*\(|createBackup|executeBackup|restoreBackup/i, `${file} real backup/storage/restore trigger`);
  rejectPattern(content, /\.env\.local|\.dev\.vars/, `${file} env file read`);
  rejectPattern(content, /Bearer\s+[A-Za-z0-9._-]{20,}/, `${file} bearer token value`);
  rejectPattern(content, /eyJ[A-Za-z0-9_-]{20,}/, `${file} JWT-looking token`);
  rejectPattern(content, /password\s*[:=]\s*['"][^'"]+['"]/i, `${file} hardcoded password`);
  rejectPattern(content, /secret\s*[:=]\s*['"][^'"]+['"]/i, `${file} hardcoded secret`);
  rejectPattern(content, /token\s*[:=]\s*['"][^'"]+['"]/i, `${file} hardcoded token`);
}

for (const token of [
  "BACKUP_PERMISSION_SEED_DRY_RUN_ONLY",
  "dry_run: true",
  "migration_written: false",
  "db_mutation: false",
  "network_call: false",
  "backup.operator.execute",
  "backup.operator.restore",
  "not enabled now",
]) {
  requireIncludes(dryRunSeed, token, `dry-run seed token ${token}`);
}

for (const forbidden of [
  "supabase",
  "createClient",
  ".env.local",
  ".dev.vars",
  "fetch(",
  "wrangler deploy",
  "supabase db push",
]) {
  rejectIncludes(dryRunSeed, forbidden, `dry-run seed ${forbidden}`);
}

if (failures.length > 0) {
  console.error("Backup permission activation guardrails check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission activation guardrails check passed.");
