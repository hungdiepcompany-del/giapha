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

const doc = readFile("docs/102_VERIFICATION_CREDENTIAL_COMPLETION_HANDOFF.md");
const checker = readFile(
  "scripts/check-verification-credential-completion-handoff.cjs",
);
const packageJson = readJson("package.json");

for (const token of [
  "## Phase 98-102 Summary",
  "## DB Verification Result",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "## Four Permission Verification Result",
  "## Role Assignment Verification Result",
  "## Authenticated Smoke Result",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "## Local/Static Smoke Result",
  "## Fallback Status",
  "NOT_READY_FOR_FALLBACK_REMOVAL",
  "## Execute/Restore Status",
  "## Runtime Change Status",
  "## Migration Change Status",
  "## Boundary Summary",
  "## Known Notes",
  "## Recommended Next Phase",
  "Phase 103 - Verification Environment Completion",
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
    scripts["check:verification-credential-completion-handoff"] !==
    "node scripts/check-verification-credential-completion-handoff.cjs"
  ) {
    failures.push("package missing Phase 102 checker");
  }
}

if (failures.length > 0) {
  console.error("Verification credential completion handoff check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Verification credential completion handoff check passed.");
