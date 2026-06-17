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

const doc = readFile("docs/41_BACKUP_SERVICE_WORKER_INTEGRATION_READINESS.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Integration Readiness Goal",
  "## Main App Boundary",
  "## Service Binding Option",
  "## Internal Token Option",
  "## Request Envelope",
  "## Response Envelope",
  "## Error Mapping",
  "## Timeout/Retry Policy",
  "## Logging Policy",
  "## No-Production-Call Policy",
  "## Future Env Placeholders",
  "## Required Approvals Before Real Integration",
  "## Phase 41 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "service binding",
  "Bearer token",
  "Authorization: Bearer BACKUP_SERVICE_INTERNAL_TOKEN",
  "Request Envelope",
  "Response Envelope",
  "Timeout/Retry Policy",
  "Logging Policy",
  "No-Production-Call Policy",
  "No service binding",
  "No internal URL",
  "No network call",
  "Do not deploy",
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
  rejectIncludes(doc, forbidden, `integration readiness doc ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-integration-readiness"] !== "node scripts/check-backup-service-worker-integration-readiness.cjs") {
    failures.push("package.json missing check:backup-service-worker-integration-readiness script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker integration readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker integration readiness check passed.");
