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

const doc = readFile("docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md");
const adapterScript = readFile("scripts/local-sandbox-storage-adapter.cjs");
const packageJson = readJson("package.json");
const adapterIndex = readJson("fixtures/backup-sandbox/adapter/adapter-index.fixture.json");

for (const section of [
  "## Production Baseline",
  "## Local Adapter Goal",
  "## Local Sandbox Path",
  "## Adapter Operations Implemented",
  "## Fixture-Only Policy",
  "## Verification Rules",
  "## No-Cloud Policy",
  "## Secret/Privacy Guardrails",
  "## What This Proves",
  "## What This Does Not Prove",
  "## PASS/FAIL Criteria",
  "## Phase 34 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "LOCAL_STORAGE_ADAPTER_ONLY",
  "fixtures/backup-sandbox/adapter/",
  "Put artifact",
  "List artifacts",
  "Read metadata",
  "Verify artifact",
  "Delete artifact: not implemented",
  "No Cloudflare R2 API",
  "No Google Drive API",
  "No Supabase Storage API",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "LOCAL_STORAGE_ADAPTER_ONLY",
  "putBackupArtifact",
  "listBackupArtifacts",
  "getBackupArtifactMetadata",
  "verifyBackupArtifact",
  "fixtures\", \"backup-sandbox\", \"adapter",
]) {
  requireIncludes(adapterScript, token, `adapter script ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "googleapis",
  "wrangler",
  ".env.local",
  ".dev.vars",
  "XMLHttpRequest",
  "http.request",
  "https.request",
  "supabase.from",
]) {
  rejectIncludes(adapterScript, forbidden, `adapter script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:local-sandbox-storage-adapter-prototype"] !== "node scripts/check-local-sandbox-storage-adapter-prototype.cjs") {
    failures.push("package.json missing check:local-sandbox-storage-adapter-prototype script");
  }
  if (scripts["backup:storage:adapter:local"] !== "node scripts/local-sandbox-storage-adapter.cjs") {
    failures.push("package.json missing backup:storage:adapter:local script");
  }
}

if (adapterIndex) {
  if (adapterIndex.marker !== "LOCAL_STORAGE_ADAPTER_ONLY") {
    failures.push("adapter index marker mismatch");
  }
  if (adapterIndex.adapterRoot !== "fixtures/backup-sandbox/adapter") {
    failures.push("adapter index root must stay in fixtures/backup-sandbox/adapter");
  }
  if (adapterIndex.contains_real_data !== false) {
    failures.push("adapter index contains_real_data must be false");
  }
  if (adapterIndex.contains_secret !== false) {
    failures.push("adapter index contains_secret must be false");
  }
  if (adapterIndex.result !== "PASS") {
    failures.push("adapter index result must be PASS");
  }
}

for (const [relativePath, content] of [
  ["docs/34_LOCAL_SANDBOX_STORAGE_ADAPTER_PROTOTYPE.md", doc],
  ["scripts/local-sandbox-storage-adapter.cjs", adapterScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Local sandbox storage adapter prototype check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Local sandbox storage adapter prototype check passed.");
