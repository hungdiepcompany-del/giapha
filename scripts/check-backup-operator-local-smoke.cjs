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

const doc = readFile("docs/61_BACKUP_OPERATOR_LOCAL_SMOKE.md");
const smoke = readFile("scripts/smoke-backup-operator-dry-run.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Smoke Goal",
  "## Static Smoke Scope",
  "## Expected Output",
  "## No-Network Policy",
  "## Limitations",
  "## Phase 61 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY",
  "Result: PASS",
  "No-Network Policy",
  "source-level readiness only",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY",
  "app/api/admin/backups/service-dry-run/route.ts",
  "app/(admin)/admin/backups/page.tsx",
  "components/admin/backup-operator-dry-run-panel.tsx",
  "scripts/check-backup-operator-ui-guardrails.cjs",
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
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(smoke)) failures.push(`possible hardcoded secret in smoke script: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["smoke:backup-operator:dry-run"] !== "node scripts/smoke-backup-operator-dry-run.cjs") {
    failures.push("package.json missing smoke:backup-operator:dry-run script");
  }
  if (scripts["check:backup-operator-local-smoke"] !== "node scripts/check-backup-operator-local-smoke.cjs") {
    failures.push("package.json missing check:backup-operator-local-smoke script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator local smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator local smoke check passed.");
