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

const doc = readFile("docs/46_BACKUP_SERVICE_WORKER_MAIN_APP_BINDING_CONTRACT.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Binding Contract Goal",
  "## Main App Boundary",
  "## Service Binding Option",
  "## Internal URL Option",
  "## Auth Header Contract",
  "## Request Envelope Contract",
  "## Response Envelope Contract",
  "## Error Mapping",
  "## Timeout Policy",
  "## Retry Policy",
  "## Logging Policy",
  "## Permission Boundary",
  "## Future Implementation Checklist",
  "## Phase 46 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Option A: Cloudflare service binding",
  "Option B: internal URL + Bearer token",
  "service binding",
  "internal URL",
  "Bearer token",
  "Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN",
  "requestId",
  "requestedByProfileId",
  "dryRun",
  "ok",
  "code",
  "message",
  "Timeout Policy",
  "Retry Policy",
  "Logging Policy",
  "Permission Boundary",
  "backup.manage",
  "No main app runtime change",
  "No binding added to production config",
  "No real token configured",
  "No service call",
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
  rejectIncludes(doc, forbidden, `binding contract doc ${forbidden}`);
}

for (const secretPattern of [
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][^'"]+['"]/,
  /CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /GOOGLE_CLIENT_SECRET\s*[:=]\s*['"][^'"]+['"]/,
  /BACKUP_SERVICE_INTERNAL_TOKEN\s*[:=]\s*['"][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  if (secretPattern.test(doc)) failures.push(`possible plaintext secret matched ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-main-app-binding-contract"] !== "node scripts/check-backup-service-worker-main-app-binding-contract.cjs") {
    failures.push("package.json missing check:backup-service-worker-main-app-binding-contract script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker main app binding contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker main app binding contract check passed.");
