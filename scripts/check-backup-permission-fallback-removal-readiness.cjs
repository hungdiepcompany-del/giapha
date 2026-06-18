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

function requireIncludesIgnoreCase(content, token, label = token) {
  if (!content.toLowerCase().includes(token.toLowerCase())) {
    failures.push(`missing ${label}`);
  }
}

const doc = readFile(
  "docs/91_BACKUP_PERMISSION_FALLBACK_REMOVAL_READINESS.md",
);
const apiRoute = readFile(
  "app/api/admin/backups/service-dry-run/route.ts",
);
const uiPage = readFile("app/(admin)/admin/backups/page.tsx");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Fallback Removal Readiness Goal",
  "## Current Fallback Status",
  "## Migration Apply Status",
  "## Permission Verification Status",
  "## Runtime Smoke Status",
  "## Required Additional Approval",
  "## API Fallback Removal Readiness",
  "## UI Fallback Removal Readiness",
  "## Rollback Plan",
  "## No-Runtime-Change Policy",
  "## Phase 91 Boundary",
  "## Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "Fallback `permissions.manage` still remains in Phase 91",
  "Do not remove fallback until owner separately approves",
  "OWNER_CONFIRMED_APPLIED",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "PARTIAL_LOCAL_STATIC_ONLY",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "Phase 91 is docs/check only",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

requireIncludesIgnoreCase(
  apiRoute,
  "permissions.manage",
  "API fallback permissions.manage",
);
requireIncludesIgnoreCase(
  uiPage,
  "permissions.manage",
  "UI fallback permissions.manage",
);

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-fallback-removal-readiness"] !==
    "node scripts/check-backup-permission-fallback-removal-readiness.cjs"
  ) {
    failures.push("package missing fallback removal readiness checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission fallback removal readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission fallback removal readiness check passed.");
