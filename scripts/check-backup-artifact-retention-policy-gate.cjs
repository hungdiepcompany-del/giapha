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
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) {
    failures.push(`forbidden ${label}`);
  }
}

function scanForSecretPatterns(relativePath, content) {
  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${relativePath} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

const doc = readFile("docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md");
const retentionScript = readFile("scripts/backup-retention-policy-check.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Retention Gate Goal",
  "## Retention Policy",
  "## Fixture/Sandbox-Only Scope",
  "## Deletion Safety Rule",
  "## PASS/FAIL Criteria",
  "## Failure Handling",
  "## Phase 29 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_ARTIFACT_RETENTION_POLICY_GATE_BASELINE",
  "RETENTION_POLICY_CHECK_ONLY",
  "Weekly backups: keep 8",
  "Monthly backups: keep 12",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "RETENTION_POLICY_CHECK_ONLY",
  "weekly_keep: 8",
  "monthly_keep: 12",
  "block_when_manifest_invalid",
  "Result: PASS",
]) {
  requireIncludes(retentionScript, token, `retention script ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  ".env.local",
  ".dev.vars",
  "XMLHttpRequest",
  "unlink",
  "rmSync",
  "rmdir",
  "Remove-Item",
  "production-backup",
  "wrangler",
]) {
  rejectIncludes(retentionScript, forbidden, `retention script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-artifact-retention-policy-gate"] !== "node scripts/check-backup-artifact-retention-policy-gate.cjs") {
    failures.push("package.json missing check:backup-artifact-retention-policy-gate script");
  }
  if (scripts["backup:retention:check"] !== "node scripts/backup-retention-policy-check.cjs") {
    failures.push("package.json missing backup:retention:check script");
  }
}

for (const [relativePath, content] of [
  ["docs/29_BACKUP_ARTIFACT_RETENTION_POLICY_GATE.md", doc],
  ["scripts/backup-retention-policy-check.cjs", retentionScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Backup artifact retention policy gate check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup artifact retention policy gate check passed.");
