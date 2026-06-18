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

const doc = readFile("docs/63_BACKUP_OPERATOR_PERMISSION_MODEL_REVIEW.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Operator Baseline",
  "## Permission Review Goal",
  "## Existing Auth/Role Model Summary",
  "## Proposed Backup Permission",
  "## Read-Only Dry-Run Permission Boundary",
  "## Real Backup Permission Boundary",
  "## UI Access Boundary",
  "## API Access Boundary",
  "## No-Migration Policy",
  "## No-Production-Backup Policy",
  "## Acceptance Criteria",
  "## Phase 63 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "No-Migration Policy",
  "No-Production-Backup Policy",
  "UI Access Boundary",
  "API Access Boundary",
  "does not create migration",
  "does not enable",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const forbidden of [
  "supabase db push",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "npm audit fix --force",
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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in review doc: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-permission-model-review"] !== "node scripts/check-backup-operator-permission-model-review.cjs") {
    failures.push("package.json missing check:backup-operator-permission-model-review script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator permission model review check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator permission model review check passed.");
