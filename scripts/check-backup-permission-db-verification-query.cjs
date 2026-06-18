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

function requireIncludesIgnoreCase(content, token, label = token) {
  if (!content.toLowerCase().includes(token.toLowerCase())) {
    failures.push(`missing ${label}`);
  }
}

function rejectPattern(content, pattern, label) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(
  "docs/94_BACKUP_PERMISSION_DB_VERIFICATION_QUERY.md",
);
const verifier = readFile(
  "scripts/verify-backup-permissions-post-apply.cjs",
);
const checker = readFile(
  "scripts/check-backup-permission-db-verification-query.cjs",
);
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Phase 93 Credential Contract Baseline",
  "## DB Verification Goal",
  "## Verification Script Path",
  "## Shell-Only Env Placeholders",
  "## Query Scope",
  "## Permission Expectations",
  "## Role Assignment Expectations",
  "## Safe Skip Behavior",
  "## Result Interpretation",
  "## Current Run Result",
  "## Remaining Limitations",
  "## Phase 94 Boundary",
  "## Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PERMISSION_DB_VERIFICATION_READ_ONLY",
  "BACKUP_PERMISSION_VERIFY_SUPABASE_URL",
  "BACKUP_PERMISSION_VERIFY_SUPABASE_SERVER_KEY",
  "BACKUP_PERMISSION_VERIFY_MODE",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "SKIPPED_VERIFICATION_MODE_NOT_READ_ONLY",
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  '.from("permissions")',
  '.from("roles")',
  '.from("role_permissions")',
  '.select("id,code")',
  '.select("role_id,permission_id")',
  "db_mutation: false",
  "secrets_printed: false",
]) {
  requireIncludes(verifier, token, `verifier token ${token}`);
}

for (const token of [
  "Result Interpretation",
  "Remaining Limitations",
  "does not read `.env.local` or `.dev.vars`",
  "No DB mutation",
  "Fallback `permissions.manage` still remains",
  "Execute/restore runtime remains disabled",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const pattern of [
  /node:fs/,
  /readFileSync/,
  /(?:dotenv|loadEnv|envPath)/i,
  /\b(?:insert|update|delete|upsert)\b/i,
  /\.(?:insert|update|delete|upsert|rpc)\s*\(/,
  /\berror\.message\b/,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /(?:key|token|secret|password)\s*[:=]\s*["'][^"']+["']/i,
  /\bheaders\s*:/,
]) {
  rejectPattern(verifier, pattern, `unsafe verifier pattern ${pattern}`);
}

for (const pattern of [
  /require\s*\(\s*["']@supabase\/supabase-js["']\s*\)/,
  /\bcreateClient\s*\(/,
  /\bfetch\s*\(/,
  /\bprocess\.env\b/,
  /\.(?:insert|update|delete|upsert|rpc)\s*\(/,
]) {
  rejectPattern(checker, pattern, `unsafe checker behavior ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["verify:backup-permissions:post-apply"] !==
    "node scripts/verify-backup-permissions-post-apply.cjs"
  ) {
    failures.push("package missing post-apply verifier");
  }
  if (
    scripts["check:backup-permission-db-verification-query"] !==
    "node scripts/check-backup-permission-db-verification-query.cjs"
  ) {
    failures.push("package missing Phase 94 checker");
  }
}

if (failures.length > 0) {
  console.error("Backup permission DB verification query check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission DB verification query check passed.");
