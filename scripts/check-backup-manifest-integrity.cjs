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

const doc = readFile("docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md");
const verifyScript = readFile("scripts/verify-sample-backup-integrity.cjs");
const packageJson = readJson("package.json");
const fixture = readJson("fixtures/backup/sample-family.fixture.json");
const manifest = readJson("fixtures/backup/sample-family.manifest.fixture.json");

for (const section of [
  "## Production Baseline",
  "## Integrity Goal",
  "## Input Files",
  "## Manifest Checks",
  "## Fixture Checks",
  "## Verify Command",
  "## Secret/Privacy Guardrails",
  "## PASS/FAIL Criteria",
  "## Phase 24 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_MANIFEST_INTEGRITY_CHECKER_BASELINE",
  "FIXTURE_ONLY",
  "fixtures/backup/sample-family.fixture.json",
  "fixtures/backup/sample-family.manifest.fixture.json",
  "fixture_checksum_sha256",
  "checksum_algorithm",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "FIXTURE_ONLY",
  "Manifest shape: PASS",
  "Fixture shape: PASS",
  "Checksum: PASS",
  "Secret scan: PASS",
  "node:crypto",
  "fixture_checksum_sha256",
]) {
  requireIncludes(verifyScript, token, `verify script ${token}`);
}

for (const forbidden of [
  ".env.local",
  ".dev.vars",
  "createClient",
  "from(",
  "insert(",
  "delete(",
  "fetch(",
  "XMLHttpRequest",
  "wrangler",
]) {
  if (verifyScript.includes(forbidden)) {
    failures.push(`verify script contains forbidden token ${forbidden}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-manifest-integrity"] !== "node scripts/check-backup-manifest-integrity.cjs") {
    failures.push("package.json missing check:backup-manifest-integrity script");
  }
  if (scripts["backup:fixture:verify"] !== "node scripts/verify-sample-backup-integrity.cjs") {
    failures.push("package.json missing backup:fixture:verify script");
  }
}

if (fixture && manifest) {
  if (fixture.metadata?.environment !== "fixture") {
    failures.push("fixture environment must be fixture");
  }
  if (fixture.metadata?.fixture_marker !== "SAMPLE_FIXTURE_ONLY") {
    failures.push("fixture marker must be SAMPLE_FIXTURE_ONLY");
  }
  if (fixture.metadata?.contains_real_data !== false) {
    failures.push("fixture contains_real_data must be false");
  }
  if (fixture.metadata?.contains_secret !== false) {
    failures.push("fixture contains_secret must be false");
  }
  if (manifest.environment !== "fixture") {
    failures.push("manifest environment must be fixture");
  }
  if (manifest.contains_real_data !== false) {
    failures.push("manifest contains_real_data must be false");
  }
  if (manifest.contains_secret !== false) {
    failures.push("manifest contains_secret must be false");
  }
  if (manifest.checksum_algorithm !== "sha256") {
    failures.push("manifest checksum algorithm must be sha256");
  }
}

for (const [relativePath, content] of [
  ["docs/24_BACKUP_MANIFEST_INTEGRITY_CHECKER.md", doc],
  ["scripts/verify-sample-backup-integrity.cjs", verifyScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Backup manifest integrity check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup manifest integrity check passed.");
