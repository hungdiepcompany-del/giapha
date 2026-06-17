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

const doc = readFile("docs/27_BACKUP_CI_GATE_INTEGRATION.md");
const workflow = readFile(".github/workflows/backup-readiness.yml");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## CI Gate Goal",
  "## Workflow Design",
  "## Commands Included",
  "## What This CI Gate Proves",
  "## What This CI Gate Does Not Prove",
  "## Security And Privacy Guardrails",
  "## Failure Handling",
  "## Acceptance Criteria",
  "## Phase 27 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_CI_GATE_INTEGRATION_BASELINE",
  ".github/workflows/backup-readiness.yml",
  "npm run backup:pipeline:readiness",
  "npm run check:backup-ci-gate-integration",
  "No `schedule:`",
  "No GitHub `secrets.*`",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "pull_request:",
  "workflow_dispatch:",
  "npm run backup:pipeline:readiness",
  "npm run check:backup-pipeline-readiness-gate",
  "npm run check:restore-dry-run-validator",
  "npm run check:backup-manifest-integrity",
  "npm run check:sample-fixture-backup-generator",
  "npm run check:backup-dry-run-command-design",
  "npm run check:backup-ci-gate-integration",
]) {
  requireIncludes(workflow, token, `workflow ${token}`);
}

for (const forbidden of [
  "schedule:",
  "secrets.",
  "wrangler deploy",
  "git push",
  "CLOUDFLARE_API_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_SECRET",
  "npm run deploy",
  "npm run upload",
  "opennextjs-cloudflare deploy",
  "createClient",
  "supabase",
  "googleapis",
  "restore production",
  "production backup",
]) {
  rejectIncludes(workflow, forbidden, `workflow ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-ci-gate-integration"] !== "node scripts/check-backup-ci-gate-integration.cjs") {
    failures.push("package.json missing check:backup-ci-gate-integration script");
  }
}

for (const [relativePath, content] of [
  ["docs/27_BACKUP_CI_GATE_INTEGRATION.md", doc],
  [".github/workflows/backup-readiness.yml", workflow],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Backup CI gate integration check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup CI gate integration check passed.");
