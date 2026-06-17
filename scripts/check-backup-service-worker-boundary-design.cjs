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
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) {
    failures.push(`forbidden ${label}`);
  }
}

function scanForSecretPatterns(relativePath, content) {
  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

const doc = readFile("docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Worker Split Goal",
  "## Why A Small Worker",
  "## Proposed Service Path",
  "## Public Vs Internal Endpoints",
  "## Auth Boundary",
  "## Secret/Env Placeholders",
  "## JSON Envelope",
  "## Error Handling",
  "## Logging Policy",
  "## Bundle/Startup Safety",
  "## No-Production-Backup Policy",
  "## Deployment Boundary",
  "## Acceptance Criteria",
  "## Phase 38 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "services/backup-service",
  "GET /health",
  "POST /internal/backup/dry-run",
  "POST /internal/backup/fixture-verify",
  "Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN",
  "BACKUP_SERVICE_INTERNAL_TOKEN",
  "JSON envelope",
  "No real backup creation",
  "No real storage upload",
  "Do not deploy",
  "Do not push",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "googleapis",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `boundary design doc ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-boundary-design"] !== "node scripts/check-backup-service-worker-boundary-design.cjs") {
    failures.push("package.json missing check:backup-service-worker-boundary-design script");
  }
}

scanForSecretPatterns("docs/38_BACKUP_SERVICE_WORKER_BOUNDARY_DESIGN.md", doc);

if (failures.length > 0) {
  console.error("Backup service worker boundary design check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup service worker boundary design check passed.");
