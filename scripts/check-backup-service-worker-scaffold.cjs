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

function scanForSecretPatterns(relativePath, content) {
  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*[:=]\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*[:=]\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

const source = readFile("services/backup-service/src/index.ts");
const wrangler = readFile("services/backup-service/wrangler.jsonc");
const readme = readFile("services/backup-service/README.md");
const doc = readFile("docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Scaffold Goal",
  "## Service Path",
  "## Endpoint List",
  "## Auth Behavior",
  "## JSON Envelope",
  "## Secret Handling",
  "## No-Network/No-Production Policy",
  "## Wrangler Config Notes",
  "## Validation",
  "## Phase 39 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "fetch",
  "/health",
  "/internal/backup/dry-run",
  "/internal/backup/fixture-verify",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_DRY_RUN_ONLY",
  "Authorization",
  "Bearer ",
]) {
  requireIncludes(source, token, `worker source ${token}`);
}

for (const forbidden of [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_SECRET",
  "CLOUDFLARE_API_TOKEN",
  "createClient",
  "googleapis",
  "wrangler deploy",
  "fetch(\"http",
  "fetch('http",
]) {
  rejectIncludes(source, forbidden, `worker source ${forbidden}`);
}

for (const token of [
  "\"name\": \"web-gia-pha-backup-service\"",
  "\"main\": \"src/index.ts\"",
  "\"compatibility_date\"",
  "\"BACKUP_SERVICE_MODE\": \"scaffold\"",
]) {
  requireIncludes(wrangler, token, `wrangler ${token}`);
}

for (const forbidden of [
  "routes",
  "route",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "workers.dev",
]) {
  rejectIncludes(wrangler, forbidden, `wrangler ${forbidden}`);
}

requireIncludes(readme, "Not deployed.", "README deployment note");
requireIncludes(readme, "No production route.", "README route note");

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-scaffold"] !== "node scripts/check-backup-service-worker-scaffold.cjs") {
    failures.push("package.json missing check:backup-service-worker-scaffold script");
  }
}

for (const [relativePath, content] of [
  ["services/backup-service/src/index.ts", source],
  ["services/backup-service/wrangler.jsonc", wrangler],
  ["services/backup-service/README.md", readme],
  ["docs/39_BACKUP_SERVICE_WORKER_SCAFFOLD.md", doc],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Backup service worker scaffold check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker scaffold check passed.");
