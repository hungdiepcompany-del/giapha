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

const doc = readFile("docs/89_BACKUP_PERMISSION_POST_APPLY_VERIFICATION.md");
const verifier = readFile("scripts/verify-backup-permissions-post-apply.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Migration Apply Baseline",
  "## Post-Apply Verification Goal",
  "## Permission Existence Verification",
  "## Role Assignment Verification",
  "## Fallback Status",
  "## Execute/Restore Runtime Status",
  "## Verification Command/Result",
  "## Failure Handling",
  "## Phase 89 Boundary",
  "## Next Phase",
]) {
  requireIncludesIgnoreCase(doc, section, `doc section ${section}`);
}

for (const token of [
  "backup.operator.view",
  "backup.operator.dry_run",
  "backup.operator.execute",
  "backup.operator.restore",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "fallback `permissions.manage` still remains",
  "runtime behavior is not enabled",
  "No DB mutation by the verifier",
]) {
  requireIncludesIgnoreCase(doc, token, `doc token ${token}`);
}

for (const token of [
  "BACKUP_PERMISSION_POST_APPLY_VERIFY_READ_ONLY",
  "SKIPPED_MISSING_VERIFICATION_CREDENTIALS",
  "db_mutation: false",
  "secrets_printed: false",
]) {
  requireIncludesIgnoreCase(verifier, token, `verifier token ${token}`);
}

for (const pattern of [
  /\.insert\s*\(/,
  /\.update\s*\(/,
  /\.delete\s*\(/,
  /\.upsert\s*\(/,
  /postgres(?:ql)?:\/\/[^\s`]+/i,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
]) {
  rejectPattern(verifier, pattern, `unsafe verifier pattern ${pattern}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (
    scripts["check:backup-permission-post-apply-verification"] !==
    "node scripts/check-backup-permission-post-apply-verification.cjs"
  ) {
    failures.push("package missing post-apply verification checker");
  }
  if (
    scripts["verify:backup-permissions:post-apply"] !==
    "node scripts/verify-backup-permissions-post-apply.cjs"
  ) {
    failures.push("package missing read-only post-apply verifier");
  }
}

if (failures.length > 0) {
  console.error("Backup permission post-apply verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup permission post-apply verification check passed.");
