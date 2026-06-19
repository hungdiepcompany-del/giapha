const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const scanTargets = [
  "app/(admin)/admin/backups",
  "components/admin",
  "app/api/admin/backups",
  "server/services/backup-service-client.ts",
];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readOptional(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
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

const doc = readFile("docs/60_BACKUP_OPERATOR_UI_GUARDRAILS.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Guardrail Goal",
  "## Paths Scanned",
  "## Forbidden Patterns",
  "## Allowed Dry-Run Patterns",
  "## Failure Examples",
  "## Phase 60 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "app/(admin)/admin/backups",
  "components/admin",
  "app/api/admin/backups",
  "server/services/backup-service-client.ts",
  "local route `/api/admin/backups/service-dry-run`",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

const scannedFiles = scanTargets.flatMap(walkTarget);
if (scannedFiles.length === 0) failures.push("no operator source files scanned");

for (const { absolutePath, relativePath } of scannedFiles) {
  const content = fs.readFileSync(absolutePath, "utf8");

  const forbiddenPatterns = [
    [/fetch\s*\(\s*['"]https?:\/\//, "outbound URL fetch"],
    [/workers\.dev/i, "hardcoded workers.dev URL"],
    [/wrangler/i, "direct wrangler usage"],
    [/CLOUDFLARE_API_TOKEN|GOOGLE_CLIENT_SECRET|SUPABASE_SERVICE_ROLE_KEY/, "sensitive secret placeholder in operator source"],
    [/Bearer\s+[A-Za-z0-9._-]{20,}/, "hardcoded bearer token"],
    [/eyJ[A-Za-z0-9_-]{20,}/, "JWT-like token"],
    [/password\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded password"],
    [/secret\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded secret"],
    [/token\s*[:=]\s*['"][^'"]+['"]/i, "hardcoded token"],
    [/\.env\.local|\.dev\.vars/, "env file read/reference"],
    [/createClient|@supabase|supabase\./i, "direct Supabase API usage"],
    [/cloudflare/i, "direct Cloudflare API usage"],
    [/googleapis|google\./i, "direct Google API usage"],
    [/storage\.from|\.upload\s*\(/i, "storage upload call"],
    [/restoreExecuted\s*:\s*true|restore\s*:\s*true/i, "restore trigger"],
    [/realBackupCreated\s*:\s*true|production_backup\s*:\s*true/i, "production backup trigger"],
    [/realStorageUpload\s*:\s*true|storage_upload\s*:\s*true/i, "real storage upload trigger"],
    [/cron|schedule\s*:/i, "cron/schedule trigger"],
  ];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${relativePath}: forbidden ${label}`);
    }
  }
}

const route = readOptional("app/api/admin/backups/service-dry-run/route.ts");
const component = readOptional("components/admin/backup-operator-dry-run-panel.tsx");

requireIncludes(route, "BACKUP_OPERATOR_API_DRY_RUN_ONLY", "API dry-run marker");
requireIncludes(component, "Chỉ kiểm tra thử", "UI dry-run warning");
requireIncludes(component, "/api/admin/backups/service-dry-run", "UI local route call");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-ui-guardrails"] !== "node scripts/check-backup-operator-ui-guardrails.cjs") {
    failures.push("package.json missing check:backup-operator-ui-guardrails script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator UI guardrail check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator UI guardrail check passed.");
