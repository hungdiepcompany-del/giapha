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
  "docs/96_BACKUP_PERMISSION_VERIFICATION_COMPLETION_RUN.md",
);
const checker = readFile(
  "scripts/check-backup-permission-verification-completion-run.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Verification Completion Goal",
  "## DB Verification Result",
  "## Authenticated Endpoint Smoke Result",
  "## Local/Static Smoke Result",
  "## Remaining Limitations",
  "## Fallback Status",
  "## Execute/Restore Runtime Status",
  "## Phase 96 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "Permission verification: `NOT_RUN`",
  "Role assignment verification: `NOT_RUN`",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "API permission guard: PASS",
  "UI permission guard: PASS",
  "Backup operator dry-run smoke",
  "Fallback `permissions.manage` still remains",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "`backup.operator.execute` runtime remains disabled",
  "`backup.operator.restore` runtime remains disabled",
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
    scripts["check:backup-permission-verification-completion-run"] !==
    "node scripts/check-backup-permission-verification-completion-run.cjs"
  ) {
    failures.push("package missing Phase 96 checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission verification completion run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission verification completion run check passed.");
