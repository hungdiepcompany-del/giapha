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

const doc = readFile("docs/43_BACKUP_SERVICE_WORKER_DEPLOY_READINESS_GATE.md");
const worker = readFile("services/backup-service/src/index.ts");
const wrangler = readJson("services/backup-service/wrangler.jsonc");
readFile("services/backup-service/README.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Deploy Readiness Goal",
  "## Wrangler Config Readiness",
  "## Endpoint Readiness",
  "## Auth Readiness",
  "## JSON Envelope Readiness",
  "## Secret Safety",
  "## No-Route/No-Deploy Policy",
  "## Future Deploy Command Placeholder",
  "## PASS/FAIL Criteria",
  "## Phase 43 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "services/backup-service",
  "web-gia-pha-backup-service",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_DRY_RUN_ONLY",
  "npx wrangler deploy",
  "not to be run in Phase 43",
  "No deploy",
  "No production backup",
  "No secret committed",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "/health",
  "/internal/backup/dry-run",
  "/internal/backup/fixture-verify",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_DRY_RUN_ONLY",
  "JsonEnvelope",
  "application/json; charset=utf-8",
]) {
  requireIncludes(worker, token, `worker ${token}`);
}

for (const forbidden of [
  "createClient",
  "googleapis",
  "supabase.from",
  "supabase.storage",
  "productionBackup: true",
  "realBackupCreated: true",
  "realStorageUpload: true",
  "restoreExecuted: true",
]) {
  rejectIncludes(worker, forbidden, `worker ${forbidden}`);
}

if (wrangler) {
  if (wrangler.name !== "web-gia-pha-backup-service") {
    failures.push("wrangler name must be web-gia-pha-backup-service");
  }
  if (wrangler.main !== "src/index.ts") {
    failures.push("wrangler main must be src/index.ts");
  }
  if (!wrangler.compatibility_date) {
    failures.push("wrangler compatibility_date is required");
  }
  if (wrangler.workers_dev !== false) {
    failures.push("wrangler workers_dev must remain false before approval");
  }
  if ("route" in wrangler || "routes" in wrangler) {
    failures.push("wrangler must not configure a production route");
  }

  const serializedWrangler = JSON.stringify(wrangler);
  for (const secretPattern of [
    /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]+['"]/,
    /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
    /GOOGLE_CLIENT_SECRET\s*[:=]\s*['"][^'"]+['"]/,
    /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
    /eyJ[A-Za-z0-9_-]{20,}/,
  ]) {
    if (secretPattern.test(serializedWrangler)) {
      failures.push(`possible hardcoded secret in wrangler config: ${secretPattern}`);
    }
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-deploy-readiness"] !== "node scripts/check-backup-service-worker-deploy-readiness.cjs") {
    failures.push("package.json missing check:backup-service-worker-deploy-readiness script");
  }
  for (const [name, command] of Object.entries(scripts)) {
    if (String(command).includes("wrangler deploy")) {
      failures.push(`package script ${name} must not run wrangler deploy`);
    }
  }
}

if (failures.length > 0) {
  console.error("Backup service worker deploy readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker deploy readiness check passed.");
