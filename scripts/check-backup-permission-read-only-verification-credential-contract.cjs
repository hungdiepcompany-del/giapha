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

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(
  "docs/93_BACKUP_PERMISSION_READ_ONLY_VERIFICATION_CREDENTIAL_CONTRACT.md",
);
const checker = readFile(
  "scripts/check-backup-permission-read-only-verification-credential-contract.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Verification Limitation From Phase 89",
  "## Credential Contract Goal",
  "## Allowed Env Placeholders",
  "## Read-Only Query Policy",
  "## No-Secret-Logging Policy",
  "## No-Env-File Policy",
  "## Safe Skip Behavior",
  "## No-DB-Mutation Policy",
  "## Phase 93 Boundary",
  "## Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_VERIFY_SUPABASE_URL",
  "BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY",
  "BACKUP_PERMISSION_VERIFY_MODE=read_only",
  "may have broad server-side privileges",
  "SELECT-only",
  "No insert, update, delete, upsert, RPC mutation",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "must not read",
  ".env.local",
  ".dev.vars",
  "must never print",
  "db_mutation: false",
  "fallback `permissions.manage` still remains",
  "execute/restore runtime behavior is still disabled",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

if (doc.includes("BACKUP_PERMISSION_VERIFY_SUPABASE_READONLY_KEY")) {
  failures.push("doc still contains legacy readonly-key placeholder");
}

for (const pattern of [
  /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /(?:key|token|secret|password)\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(doc, pattern, `possible credential value ${pattern}`);
}

for (const pattern of [
  /require\s*\(\s*["']@supabase\/supabase-js["']\s*\)/,
  /\bcreateClient\s*\(/,
  /\bfetch\s*\(/,
  /\baxios\b/,
  /\bhttps?\.(?:get|request)\s*\(/,
  /\bprocess\.env\b/,
  /readFileSync\s*\([^)]*(?:\.env\.local|\.dev\.vars)/,
  /\.(?:insert|update|delete|upsert|rpc)\s*\(/,
]) {
  rejectPattern(checker, pattern, `unsafe checker behavior ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts[
      "check:backup-permission-read-only-verification-credential-contract"
    ] !==
    "node scripts/check-backup-permission-read-only-verification-credential-contract.cjs"
  ) {
    failures.push("package missing read-only verification contract checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission read-only verification contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission read-only verification contract check passed.");
