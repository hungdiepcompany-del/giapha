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
  "docs/98_VERIFICATION_CREDENTIAL_COMPLETION_RUNBOOK.md",
);
const checker = readFile(
  "scripts/check-verification-credential-completion-runbook.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Current Verification Limitation",
  "## Goal",
  "## Shell-Only Env Policy",
  "## Windows CMD Set Examples Without Real Values",
  "## PowerShell Env Examples Without Real Values",
  "## DB Verification Env Names",
  "## Authenticated Smoke Env Names",
  "## No Env File Policy",
  "## No Secret Logging Policy",
  "## Safe Skip Behavior",
  "## Phase 98 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "set BACKUP_PERMISSION_VERIFY_SUPABASE_URL=<SUPABASE_URL>",
  '$env:BACKUP_PERMISSION_VERIFY_SUPABASE_URL="<SUPABASE_URL>"',
  "BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY",
  "BACKUP_PERMISSION_VERIFY_MODE=read_only",
  "BACKUP_PERMISSION_SMOKE_BASE_URL",
  "BACKUP_PERMISSION_SMOKE_EXPECTED_USER",
  "BACKUP_PERMISSION_SMOKE_AUTH_COOKIE",
  "BACKUP_PERMISSION_SMOKE_BEARER_TOKEN",
  "Do not save these values in `.env.local`, `.dev.vars`",
  "must not print URL values",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "SKIPPED_MISSING_EXPLICIT_ENV",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
]) {
  rejectPattern(doc, pattern, `possible credential ${pattern}`);
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
    scripts["check:verification-credential-completion-runbook"] !==
    "node scripts/check-verification-credential-completion-runbook.cjs"
  ) {
    failures.push("package missing Phase 98 checker");
  }
}

if (failures.length > 0) {
  console.error("Verification credential completion runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Verification credential completion runbook check passed.");
