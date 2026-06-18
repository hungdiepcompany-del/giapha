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

const doc = readFile("docs/80_BACKUP_PERMISSION_RUNTIME_FALLBACK_REMOVAL_PLAN.md");
const apiRoute = readFile("app/api/admin/backups/service-dry-run/route.ts");
const uiPage = readFile("app/(admin)/admin/backups/page.tsx");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Current Runtime Fallback Status",
  "## Fallback Removal Goal",
  "## Preconditions Before Removal",
  "## Required DB Migration Applied Confirmation",
  "## Required Permission Assignment Confirmation",
  "## API Fallback Removal Plan",
  "## UI Fallback Removal Plan",
  "## Post-Removal Smoke Plan",
  "## Rollback Plan",
  "## No-Runtime-Change Policy",
  "## Phase 80 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Current fallback:",
  "permissions.manage",
  "migration has been applied",
  "`backup.operator.view` exists in DB",
  "`backup.operator.dry_run` exists in DB",
  "expected roles have assignments",
  "smoke test passes with real user",
  "API Fallback Removal Plan",
  "UI Fallback Removal Plan",
  "Rollback Plan",
  "No-Runtime-Change Policy",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

requireIncludes(apiRoute, "permissions.manage", "API runtime fallback still present");
requireIncludes(uiPage, "permissions.manage", "UI runtime fallback still present");

for (const forbidden of [
  "supabase db push",
  "supabase migration up",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "read secret value",
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in fallback removal plan: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-runtime-fallback-removal-plan"] !==
    "node scripts/check-backup-permission-runtime-fallback-removal-plan.cjs"
  ) {
    failures.push("package.json missing check:backup-permission-runtime-fallback-removal-plan script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission runtime fallback removal plan check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission runtime fallback removal plan check passed.");
