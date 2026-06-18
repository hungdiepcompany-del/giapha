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

const doc = readFile("docs/72_BACKUP_PERMISSION_SEED_READINESS_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Operator Permission Current Status",
  "## Phase 68-72 Summary",
  "## Permission Names",
  "## Seed Dry-Run Status",
  "## Assignment Runbook Status",
  "## Activation Guardrail Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Required Future Migration/Seed",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "Phase 68-72",
  "Seed dry-run status",
  "Assignment runbook status",
  "Activation guardrail status",
  "No migration/schema in Phase 68-72",
  "No DB mutation",
  "No real worker call",
  "No deploy",
  "No production backup",
  "No real storage",
  "No secret committed",
  "still not enabled",
  "permissions.manage",
  "Required Future Migration/Seed",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "supabase migration up",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "read secret value",
  "run production backup",
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in seed readiness handoff: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-seed-readiness-handoff"] !==
    "node scripts/check-backup-permission-seed-readiness-handoff.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-seed-readiness-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission seed readiness handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission seed readiness handoff check passed.");
