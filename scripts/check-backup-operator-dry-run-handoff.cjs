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

const doc = readFile("docs/62_BACKUP_OPERATOR_DRY_RUN_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Service Status",
  "## Main App Binding Status",
  "## Phase 58-62 Summary",
  "## Operator API Status",
  "## Operator UI Status",
  "## Guardrail Status",
  "## Smoke Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Phase 58-62 Summary",
  "Operator API Status",
  "Operator UI Status",
  "Guardrail Status",
  "Smoke Status",
  "app/api/admin/backups/service-dry-run/route.ts",
  "app/(admin)/admin/backups/page.tsx",
  "components/admin/backup-operator-dry-run-panel.tsx",
  "scripts/check-backup-operator-ui-guardrails.cjs",
  "scripts/smoke-backup-operator-dry-run.cjs",
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_DRY_RUN_SMOKE_ONLY",
  "dry-run only",
  "no real worker call",
  "no deploy",
  "no production backup",
  "no real storage",
  "no secret committed",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "fetch(",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `doc ${forbidden}`);
}

for (const secretPattern of [
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in handoff doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-dry-run-handoff"] !== "node scripts/check-backup-operator-dry-run-handoff.cjs") {
    failures.push("package.json missing check:backup-operator-dry-run-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator dry-run handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator dry-run handoff check passed.");
