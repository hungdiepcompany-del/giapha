const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const scanTargets = [
  "app/api/admin/backups",
  "app/(admin)/admin/backups",
  "components/admin/backup-operator-dry-run-panel.tsx",
  "server/services/backup-service-client.ts",
];

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

function walkTarget(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) {
    return allowedExtensions.has(path.extname(absolutePath))
      ? [{ absolutePath, relativePath: relativePath.replaceAll("\\", "/") }]
      : [];
  }

  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const childAbsolutePath = path.join(absolutePath, entry.name);
    const childRelativePath = path.relative(root, childAbsolutePath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".open-next", ".wrangler"].includes(entry.name)) continue;
      files.push(...walkTarget(childRelativePath));
      continue;
    }
    if (allowedExtensions.has(path.extname(entry.name))) {
      files.push({ absolutePath: childAbsolutePath, relativePath: childRelativePath });
    }
  }
  return files;
}

const doc = readFile("docs/66_BACKUP_OPERATOR_PERMISSION_SMOKE_GUARDRAILS.md");
const packageJson = readJson("package.json");
const scannedFiles = scanTargets.flatMap(walkTarget);
const combinedSource = scannedFiles
  .map(({ absolutePath }) => fs.readFileSync(absolutePath, "utf8"))
  .join("\n");

for (const section of [
  "## Production Baseline",
  "## Permission Smoke Goal",
  "## Paths Scanned",
  "## Required Markers",
  "## Forbidden Patterns",
  "## Expected Output",
  "## No-Network Policy",
  "## Phase 66 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY",
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_API_PERMISSION_GUARD",
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD",
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY",
  "backup.operator.dry_run",
  "backup.operator.view",
  "permissions.manage",
  "No-Network Policy",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

if (scannedFiles.length === 0) failures.push("no operator permission guard source files scanned");

for (const token of [
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_API_PERMISSION_GUARD",
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD",
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY",
  "backup.operator.dry_run",
  "backup.operator.view",
  "permissions.manage",
  "worker_call: false",
  "production_backup: false",
  "storage_upload: false",
  "restore: false",
  "realBackupCreated: false",
  "realStorageUpload: false",
  "restoreExecuted: false",
]) {
  requireIncludes(combinedSource, token, `source token ${token}`);
}

for (const { absolutePath, relativePath } of scannedFiles) {
  const content = fs.readFileSync(absolutePath, "utf8");
  const forbiddenPatterns = [
    [/fetch\s*\(\s*['"]https?:\/\//, "outbound URL fetch"],
    [/workers\.dev/i, "hardcoded workers.dev URL"],
    [/\.env\.local|\.dev\.vars/, "env file read/reference"],
    [/CLOUDFLARE_API_TOKEN|GOOGLE_CLIENT_SECRET|SUPABASE_SERVICE_ROLE_KEY/, "sensitive secret placeholder in operator source"],
    [/Bearer\s+[A-Za-z0-9._-]{20,}/, "hardcoded bearer token"],
    [/eyJ[A-Za-z0-9_-]{20,}/, "JWT-like token"],
    [/password\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded password"],
    [/secret\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded secret"],
    [/token\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded token"],
    [/storage\.from|\.upload\s*\(/i, "storage upload call"],
    [/restoreExecuted\s*:\s*true|restore\s*:\s*true/i, "restore trigger"],
    [/realBackupCreated\s*:\s*true|production_backup\s*:\s*true/i, "production backup trigger"],
    [/realStorageUpload\s*:\s*true|storage_upload\s*:\s*true/i, "real storage upload trigger"],
    [/\bcron\b|schedule\s*:/i, "cron/schedule trigger"],
  ];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${relativePath}: forbidden ${label}`);
    }
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["smoke:backup-operator:permission-guard"] !== "node scripts/smoke-backup-operator-permission-guard.cjs") {
    failures.push("package.json missing smoke:backup-operator:permission-guard script");
  }
  if (scripts["check:backup-operator-permission-guardrails"] !== "node scripts/check-backup-operator-permission-guardrails.cjs") {
    failures.push("package.json missing check:backup-operator-permission-guardrails script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator permission guardrail check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator permission guardrail check passed.");
