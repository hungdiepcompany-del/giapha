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

const doc = readFile("docs/68_BACKUP_PERMISSION_MIGRATION_SEED_DESIGN.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Operator Permission Baseline",
  "## Existing Permission Model Summary",
  "## Existing Migration/Seed Pattern Summary",
  "## Proposed Backup Permissions",
  "## Permission Descriptions",
  "## Role Assignment Recommendation",
  "## Migration Strategy Options",
  "## Seed Strategy Options",
  "## Rollback Strategy",
  "## No-Mutation Policy",
  "## Acceptance Criteria",
  "## Phase 68 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "OWNER",
  "ADMIN",
  "PUBLIC_VIEWER",
  "Migration Strategy Options",
  "Seed Strategy Options",
  "Rollback Strategy",
  "No-Mutation Policy",
  "no migration file is created",
  "no DB/network/API call is made",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "supabase migration up",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  ".env.local value",
  ".dev.vars value",
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in design doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-permission-migration-seed-design"] !== "node scripts/check-backup-permission-migration-seed-design.cjs") {
    failures.push("package.json missing check:backup-permission-migration-seed-design script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission migration/seed design check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission migration/seed design check passed.");
