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

const doc = readFile("docs/101_VERIFICATION_RESULT_CONSOLIDATION.md");
const checker = readFile("scripts/check-verification-result-consolidation.cjs");
const packageJson = readJson("package.json");

for (const token of [
  "## DB Verification Final Status",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "## Four Permissions Independent Verification Status",
  "```txt\nNO\n```",
  "## Role Assignment Verification Status",
  "```txt\nNOT_RUN\n```",
  "## Authenticated Endpoint Smoke Final Status",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "## Local/Static Smoke Status",
  "## Dry-Run Smoke Status",
  "## Fallback Status",
  "## Execute/Restore Status",
  "## Fallback Removal Readiness",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "## Remaining Blockers",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
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
    scripts["check:verification-result-consolidation"] !==
    "node scripts/check-verification-result-consolidation.cjs"
  ) {
    failures.push("package missing Phase 101 checker");
  }
}

if (failures.length > 0) {
  console.error("Verification result consolidation check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Verification result consolidation check passed.");
