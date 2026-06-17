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

const doc = readFile("docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md");
const sandboxScript = readFile("scripts/backup-storage-sandbox-simulate.cjs");
const packageJson = readJson("package.json");
const sandboxIndex = readJson("fixtures/backup-sandbox/storage-index.fixture.json");

for (const section of [
  "## Production Baseline",
  "## Sandbox Storage Goal",
  "## Local-Only Storage Simulation",
  "## Files Copied",
  "## Storage Index Simulation",
  "## Security/Privacy Guardrails",
  "## What This Proves",
  "## What This Does Not Prove",
  "## PASS/FAIL Criteria",
  "## Phase 28 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION_BASELINE",
  "LOCAL_SANDBOX_ONLY",
  "fixtures/backup-sandbox/",
  "storage-index.fixture.json",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "LOCAL_SANDBOX_ONLY",
  "sample-family.fixture.json",
  "sample-family.manifest.fixture.json",
  "storage-index.fixture.json",
  "Result: PASS",
]) {
  requireIncludes(sandboxScript, token, `sandbox script ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "wrangler",
  "r2",
  "googleapis",
  "supabase",
  ".env.local",
  ".dev.vars",
  "XMLHttpRequest",
]) {
  rejectIncludes(sandboxScript, forbidden, `sandbox script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:local-sandbox-backup-storage-simulation"] !== "node scripts/check-local-sandbox-backup-storage-simulation.cjs") {
    failures.push("package.json missing check:local-sandbox-backup-storage-simulation script");
  }
  if (scripts["backup:storage:sandbox"] !== "node scripts/backup-storage-sandbox-simulate.cjs") {
    failures.push("package.json missing backup:storage:sandbox script");
  }
}

for (const relativePath of [
  "fixtures/backup-sandbox/sample-family.fixture.json",
  "fixtures/backup-sandbox/sample-family.manifest.fixture.json",
]) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    failures.push(`missing ${relativePath}`);
  }
}

if (sandboxIndex) {
  if (sandboxIndex.marker !== "LOCAL_SANDBOX_ONLY") {
    failures.push("sandbox index marker mismatch");
  }
  if (sandboxIndex.environment !== "fixture") {
    failures.push("sandbox index environment must be fixture");
  }
  if (sandboxIndex.contains_real_data !== false) {
    failures.push("sandbox index contains_real_data must be false");
  }
  if (sandboxIndex.contains_secret !== false) {
    failures.push("sandbox index contains_secret must be false");
  }
  if (!Array.isArray(sandboxIndex.files) || sandboxIndex.files.length !== 2) {
    failures.push("sandbox index must list fixture and manifest files");
  }
}

for (const [relativePath, content] of [
  ["docs/28_LOCAL_SANDBOX_BACKUP_STORAGE_SIMULATION.md", doc],
  ["scripts/backup-storage-sandbox-simulate.cjs", sandboxScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Local sandbox backup storage simulation check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Local sandbox backup storage simulation check passed.");
