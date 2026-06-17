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

const doc = readFile("docs/50_BACKUP_SERVICE_WORKER_SECRETS_PREFLIGHT_CHECKLIST.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Secrets Preflight Goal",
  "## Required GitHub Secrets",
  "## Required Wrangler Secrets",
  "## Required Smoke Env",
  "## Secret Ownership",
  "## Secret Rotation",
  "## Secret Verification Without Printing Values",
  "## No-Secret-Logging Policy",
  "## No-Go Conditions",
  "## Phase 50 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_SMOKE_BASE_URL",
  "BACKUP_SERVICE_SMOKE_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "missing owner approval",
  "missing Cloudflare API token",
  "missing account id",
  "missing backup internal token",
  "no smoke URL",
  "no rollback plan",
  "local checks have not run",
  "no post-deploy tester is assigned",
  "No-Secret-Logging Policy",
  "No secret read",
  "No GitHub/Cloudflare API call",
]) {
  requireIncludes(doc, token);
}

for (const secretPattern of [
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_SMOKE_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_ACCOUNT_ID\s*[:=]\s*['"][^'"]+['"]/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-secrets-preflight-checklist"] !== "node scripts/check-backup-service-worker-secrets-preflight-checklist.cjs") {
    failures.push("package.json missing check:backup-service-worker-secrets-preflight-checklist script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker secrets preflight checklist check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker secrets preflight checklist check passed.");
