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

const doc = readFile("docs/25_RESTORE_DRY_RUN_VALIDATOR.md");
const restoreScript = readFile("scripts/restore-dry-run-validate.cjs");
const packageJson = readJson("package.json");
const fixture = readJson("fixtures/backup/sample-family.fixture.json");

for (const section of [
  "## Production Baseline",
  "## Restore Dry-Run Goal",
  "## Input Files",
  "## Validation Scope",
  "## Restore Simulation",
  "## Command",
  "## Secret/Privacy Guardrails",
  "## PASS/FAIL Criteria",
  "## Phase 25 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "RESTORE_DRY_RUN_VALIDATOR_BASELINE",
  "RESTORE_DRY_RUN_ONLY",
  "Restore execution: SKIPPED",
  "fixtures/backup/sample-family.fixture.json",
  "fixtures/backup/sample-family.manifest.fixture.json",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "RESTORE_DRY_RUN_ONLY",
  "Manifest integrity: PASS",
  "Graph validation: PASS",
  "Privacy validation: PASS",
  "Restore execution: SKIPPED",
  "node:crypto",
  "buildRestorePlan",
]) {
  requireIncludes(restoreScript, token, `restore script ${token}`);
}

for (const forbidden of [
  ".env.local",
  ".dev.vars",
  "createClient",
  "from(",
  "insert(",
  "upsert(",
  "delete(",
  "fetch(",
  "XMLHttpRequest",
  "wrangler",
]) {
  if (restoreScript.includes(forbidden)) {
    failures.push(`restore script contains forbidden token ${forbidden}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:restore-dry-run-validator"] !== "node scripts/check-restore-dry-run-validator.cjs") {
    failures.push("package.json missing check:restore-dry-run-validator script");
  }
  if (scripts["restore:dry-run"] !== "node scripts/restore-dry-run-validate.cjs") {
    failures.push("package.json missing restore:dry-run script");
  }
}

if (fixture) {
  const personIds = new Set((fixture.people || []).map((person) => person.id));
  if (!personIds.has("sample-child") || !personIds.has("sample-relative")) {
    failures.push("fixture must include expected child sample members");
  }
  if (fixture.metadata?.contains_real_data !== false) {
    failures.push("fixture contains_real_data must be false");
  }
  if (fixture.metadata?.contains_secret !== false) {
    failures.push("fixture contains_secret must be false");
  }
}

for (const [relativePath, content] of [
  ["docs/25_RESTORE_DRY_RUN_VALIDATOR.md", doc],
  ["scripts/restore-dry-run-validate.cjs", restoreScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Restore dry-run validator check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Restore dry-run validator check passed.");
