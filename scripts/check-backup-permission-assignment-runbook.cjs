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

const doc = readFile("docs/70_BACKUP_PERMISSION_ASSIGNMENT_RUNBOOK.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Assignment Goal",
  "## Permission List",
  "## Recommended Role Assignments",
  "## Operator Assignment Workflow",
  "## Approval Required Before Assignment",
  "## Verification Checklist",
  "## Rollback Checklist",
  "## No-DB-Mutation Policy",
  "## Phase 70 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "OWNER:",
  "ADMIN:",
  "Other roles:",
  "none by default unless owner approves",
  "Approval Required",
  "Verification Checklist",
  "Rollback Checklist",
  "No-DB-Mutation Policy",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

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
  if (secretPattern.test(doc)) failures.push(`possible hardcoded secret in assignment runbook: ${secretPattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-permission-assignment-runbook"] !== "node scripts/check-backup-permission-assignment-runbook.cjs") {
    failures.push("package.json missing check:backup-permission-assignment-runbook script");
  }
}

if (failures.length > 0) {
  console.error("Backup permission assignment runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission assignment runbook check passed.");
