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

const doc = readFile("docs/56_MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE.md");
const smoke = readFile("scripts/smoke-main-app-backup-service-binding.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Binding Smoke Goal",
  "## Smoke Scope",
  "## Static Checks",
  "## No-Network Policy",
  "## Expected Output",
  "## Limitations",
  "## Phase 56 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE_ONLY",
  "No-Network Policy",
  "Result: PASS",
  "No deploy",
  "No production backup",
  "No real storage",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "MAIN_APP_BACKUP_SERVICE_BINDING_SMOKE_ONLY",
  "server/services/backup-service-client.ts",
  "scripts/check-backup-service-binding-guardrails.cjs",
  "scripts/check-backup-operator-api-dry-run-contract.cjs",
  "Network execution: SKIPPED",
  "Result: PASS",
]) {
  requireIncludes(smoke, token, `smoke token ${token}`);
}

for (const forbidden of [
  "process.env",
  ".env.local",
  ".dev.vars",
  "fetch(",
  "https://",
  "http://",
  "createClient",
  "@supabase",
  "supabase",
  "storage.from",
  "CLOUDFLARE_API_TOKEN",
  "GOOGLE_CLIENT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  rejectIncludes(smoke, forbidden, `smoke ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(smoke)) failures.push(`possible hardcoded secret in smoke script: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["smoke:main-app-backup-service-binding"] !== "node scripts/smoke-main-app-backup-service-binding.cjs") {
    failures.push("package.json missing smoke:main-app-backup-service-binding script");
  }
  if (scripts["check:main-app-backup-service-binding-smoke"] !== "node scripts/check-main-app-backup-service-binding-smoke.cjs") {
    failures.push("package.json missing check:main-app-backup-service-binding-smoke script");
  }
}

if (failures.length > 0) {
  console.error("Main app backup service binding smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Main app backup service binding smoke check passed.");
