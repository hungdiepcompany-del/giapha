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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(
  "docs/97_BACKUP_PERMISSION_VERIFICATION_COMPLETION_HANDOFF.md",
);
const checker = readFile(
  "scripts/check-backup-permission-verification-completion-handoff.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Phase 95-97 Summary",
  "## Migration Apply Status",
  "## DB Verification Status",
  "## Authenticated Smoke Status",
  "## Local/Static Smoke Status",
  "## Fallback Status",
  "## Execute/Restore Status",
  "## What Is Verified",
  "## What Remains Unverified",
  "## Fallback Removal Readiness",
  "## Boundary",
  "## Known Notes",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "OWNER_CONFIRMED_APPLIED",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "Role assignment verification result: `NOT_RUN`",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "Local/Static Smoke Status",
  "Fallback `permissions.manage` still remains",
  "`backup.operator.execute` runtime is still not enabled",
  "`backup.operator.restore` runtime is still not enabled",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "No deploy",
  "No push",
  "No secret/token/key/connection string printed or committed",
  "Phase 98 - Verification Credential Completion",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /(?:password|secret|token|key)\s*[:=]\s*["'][^"']+["']/i,
]) {
  rejectPattern(doc, pattern, `possible secret ${pattern}`);
}

for (const pattern of [
  /\bfetch\s*\(/,
  /\bprocess\.env\b/,
  /\.(?:insert|update|delete|upsert|rpc)\s*\(/,
]) {
  rejectPattern(checker, pattern, `unsafe checker behavior ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-verification-completion-handoff"] !==
    "node scripts/check-backup-permission-verification-completion-handoff.cjs"
  ) {
    failures.push("package missing Phase 97 checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission verification completion handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission verification completion handoff check passed.");
