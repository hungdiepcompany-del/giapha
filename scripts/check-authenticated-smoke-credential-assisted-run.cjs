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
  "docs/100_AUTHENTICATED_SMOKE_CREDENTIAL_ASSISTED_RUN.md",
);
const checker = readFile(
  "scripts/check-authenticated-smoke-credential-assisted-run.cjs",
);
const packageJson = readJson("package.json");

for (const token of [
  "## Authenticated Endpoint Smoke",
  "SKIPPED_MISSING_EXPLICIT_ENV",
  "## Local/Static Permission Guard Smoke",
  "API permission guard: PASS",
  "UI permission guard: PASS",
  "## Dry-Run Smoke",
  "API route: PASS",
  "Guardrails: PASS",
  "## No Real Backup Policy",
  "## No Direct Worker Call Policy",
  "Fallback `permissions.manage` remains retained",
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
    scripts["check:authenticated-smoke-credential-assisted-run"] !==
    "node scripts/check-authenticated-smoke-credential-assisted-run.cjs"
  ) {
    failures.push("package missing Phase 100 checker");
  }
}

if (failures.length > 0) {
  console.error("Authenticated smoke credential assisted run check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Authenticated smoke credential assisted run check passed.");
