const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

const scanRoots = ["server", "app", "components", "lib", "services"];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

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

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".open-next", ".wrangler"].includes(entry.name)) continue;
      files.push(...walk(absolutePath));
      continue;
    }
    if (allowedExtensions.has(path.extname(entry.name))) {
      files.push({ absolutePath, relativePath });
    }
  }
  return files;
}

const doc = readFile("docs/54_BACKUP_SERVICE_BINDING_GUARDRAIL_CHECKS.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Guardrail Goal",
  "## Paths Scanned",
  "## Forbidden Patterns",
  "## Allowed Placeholders",
  "## Known Safe Exceptions",
  "## Failure Examples",
  "## Phase 54 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "server/",
  "app/",
  "components/",
  "lib/",
  "services/",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "MAIN_APP_BACKUP_SERVICE_CLIENT_DRY_RUN_ONLY",
  "backup_service_network_disabled",
]) {
  requireIncludes(doc, token);
}

const files = scanRoots.flatMap((scanRoot) => walk(path.join(root, scanRoot)));

for (const { absolutePath, relativePath } of files) {
  const content = fs.readFileSync(absolutePath, "utf8");
  const normalized = content.replace(/\s+/g, " ");

  const isWorkerScaffold = relativePath.startsWith("services/backup-service/");
  const isDryRunAdapter = relativePath === "server/services/backup-service-client.ts";

  const patterns = [
    [/BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/, "hardcoded BACKUP_SERVICE_INTERNAL_TOKEN"],
    [/Authorization\s*:\s*Bearer\s+[A-Za-z0-9._-]{20,}/i, "hardcoded bearer token"],
    [/Bearer\s+[A-Za-z0-9._-]{30,}/, "hardcoded bearer token"],
    [/https:\/\/[^'"\s]*backup[^'"\s]*workers\.dev/i, "hardcoded backup service workers.dev URL"],
    [/\.env\.local/, ".env.local read/reference"],
    [/\.dev\.vars/, ".dev.vars read/reference"],
    [/realBackupCreated\s*:\s*true/, "real backup trigger"],
    [/realStorageUpload\s*:\s*true/, "real storage upload trigger"],
    [/restoreExecuted\s*:\s*true/, "production restore trigger"],
    [/storage\.from\([^)]*\)\.upload/i, "storage upload call"],
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(content)) {
      failures.push(`${relativePath}: forbidden ${label}`);
    }
  }

  if (isDryRunAdapter && /fetch\s*\(\s*['"]https?:\/\//.test(content)) {
    failures.push(`${relativePath}: forbidden outbound URL fetch in dry-run adapter`);
  }

  if (!isWorkerScaffold && /BACKUP_SERVICE_INTERNAL_TOKEN/.test(content) && !/PLACEHOLDER|placeholder|DRY_RUN_ONLY/.test(normalized)) {
    failures.push(`${relativePath}: BACKUP_SERVICE_INTERNAL_TOKEN must remain placeholder-only`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-binding-guardrails"] !== "node scripts/check-backup-service-binding-guardrails.cjs") {
    failures.push("package.json missing check:backup-service-binding-guardrails script");
  }
}

if (failures.length > 0) {
  console.error("Backup service binding guardrail check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service binding guardrail check passed.");
