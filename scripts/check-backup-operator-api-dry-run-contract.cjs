const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];
const routePath = "app/api/admin/backups/service-dry-run/route.ts";

function readFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readOptionalFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return "";
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

const doc = readFile("docs/55_BACKUP_OPERATOR_API_DRY_RUN_CONTRACT.md");
const route = readOptionalFile(routePath);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Operator API Goal",
  "## Proposed Route",
  "## Auth/Permission Boundary",
  "## Dry-Run Response Envelope",
  "## No-Real-Backup Policy",
  "## No-Worker-Call Policy",
  "## Failure Handling",
  "## Implementation Status",
  "## Phase 55 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  routePath,
  "BACKUP_OPERATOR_API_DRY_RUN_ONLY",
  "No-Real-Backup Policy",
  "No-Worker-Call Policy",
  "Docs/check-only",
  "No route file created in Phase 55",
]) {
  requireIncludes(doc, token);
}

if (route) {
  requireIncludes(route, "BACKUP_OPERATOR_API_DRY_RUN_ONLY", "route marker");
  for (const forbidden of [
    "fetch(\"http",
    "fetch('http",
    "https://",
    ".env.local",
    ".dev.vars",
    "BACKUP_SERVICE_INTERNAL_TOKEN=",
    "storage.from",
    ".upload(",
    "restoreExecuted: true",
    "realBackupCreated: true",
    "realStorageUpload: true",
  ]) {
    rejectIncludes(route, forbidden, `route ${forbidden}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-operator-api-dry-run-contract"] !== "node scripts/check-backup-operator-api-dry-run-contract.cjs") {
    failures.push("package.json missing check:backup-operator-api-dry-run-contract script");
  }
}

if (failures.length > 0) {
  console.error("Backup operator API dry-run contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup operator API dry-run contract check passed.");
