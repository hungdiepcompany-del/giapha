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

const doc = readFile("docs/67_BACKUP_OPERATOR_PERMISSION_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Backup Operator Current Status",
  "## Phase 63-67 Summary",
  "## Proposed Permission Model",
  "## API Guard Status",
  "## UI Guard Status",
  "## Smoke/Guardrail Status",
  "## What Is Implemented",
  "## What Is Not Implemented",
  "## Required Future Migration/Seed If Needed",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Phase 63",
  "Phase 64",
  "Phase 65",
  "Phase 66",
  "Phase 67",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "permissions.manage",
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "BACKUP_OPERATOR_API_PERMISSION_GUARD",
  "BACKUP_OPERATOR_UI_PERMISSION_GUARD",
  "BACKUP_OPERATOR_PERMISSION_GUARD_SMOKE_ONLY",
  "no real worker call",
  "No deploy",
  "No production backup",
  "No real storage",
  "No hardcoded secret/token/key",
  "No migration/schema/data mutation",
  "npm run smoke:backup-operator:permission-guard",
  "npm run check:backup-operator-permission-guardrails",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "npm audit fix --force\n",
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
  if (scripts["check:backup-operator-permission-handoff"] !== "node scripts/check-backup-operator-permission-handoff.cjs") {
    failures.push("package.json missing check:backup-operator-permission-handoff script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator permission handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator permission handoff check passed.");
