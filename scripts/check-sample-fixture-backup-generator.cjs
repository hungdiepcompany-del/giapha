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

const doc = readFile("docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md");
const generator = readFile("scripts/generate-sample-backup-fixture.cjs");

for (const section of [
  "## Production Baseline",
  "## Fixture Goal",
  "## Sample Data Policy",
  "## Fixture Schema",
  "## Manifest Fixture",
  "## Generator Command",
  "## Secret/Privacy Guardrails",
  "## Restore Drill Usage",
  "## PASS/FAIL Criteria",
  "## Phase 23 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "SAMPLE_FIXTURE_BACKUP_GENERATOR_BASELINE",
  "SAMPLE_FIXTURE_ONLY",
  "Sample Root",
  "Sample Parent",
  "Sample Child",
  "environment: \"fixture\"",
  "contains_real_data",
  "contains_secret",
  "fixtures/backup/sample-family.fixture.json",
  "fixtures/backup/sample-family.manifest.fixture.json",
  "Do not commit `GIA_PHA_GITHUB_MENU.bat`",
]) {
  requireIncludes(doc, token);
}

for (const token of ["SAMPLE_FIXTURE_ONLY", "sample-family.fixture.json", "sample-family.manifest.fixture.json"]) {
  requireIncludes(generator, token, `generator ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "supabase",
  ".env.local",
  ".dev.vars",
]) {
  if (generator.includes(forbidden)) {
    failures.push(`generator contains forbidden token ${forbidden}`);
  }
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:sample-fixture-backup-generator"] !==
  "node scripts/check-sample-fixture-backup-generator.cjs"
) {
  failures.push("package.json missing script check:sample-fixture-backup-generator");
}

if (
  scripts["backup:fixture:generate"] !==
  "node scripts/generate-sample-backup-fixture.cjs"
) {
  failures.push("package.json missing script backup:fixture:generate");
}

const fixture = readJson("fixtures/backup/sample-family.fixture.json");
const manifest = readJson("fixtures/backup/sample-family.manifest.fixture.json");

if (fixture) {
  if (fixture.metadata?.environment !== "fixture") {
    failures.push("fixture environment must be fixture");
  }
  if (fixture.metadata?.contains_real_data !== false) {
    failures.push("fixture contains_real_data must be false");
  }
  if (fixture.metadata?.contains_secret !== false) {
    failures.push("fixture contains_secret must be false");
  }
  if (!Array.isArray(fixture.people) || fixture.people.length < 3 || fixture.people.length > 5) {
    failures.push("fixture must contain 3-5 sample people");
  }
}

if (manifest) {
  if (manifest.environment !== "fixture") {
    failures.push("manifest environment must be fixture");
  }
  if (manifest.contains_real_data !== false) {
    failures.push("manifest contains_real_data must be false");
  }
  if (manifest.contains_secret !== false) {
    failures.push("manifest contains_secret must be false");
  }
}

for (const file of [
  "docs/23_SAMPLE_FIXTURE_BACKUP_GENERATOR.md",
  "scripts/check-sample-fixture-backup-generator.cjs",
  "scripts/generate-sample-backup-fixture.cjs",
  "fixtures/backup/sample-family.fixture.json",
  "fixtures/backup/sample-family.manifest.fixture.json",
]) {
  const content = readFile(file);
  if (content) {
    scanForSecretPatterns(file, content);
  }
}

if (failures.length > 0) {
  console.error("Sample fixture backup generator check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sample fixture backup generator check passed.");
