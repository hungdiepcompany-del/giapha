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

const doc = readFile("docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md");
const verifyScript = readFile("scripts/verify-storage-upload-dry-run.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Upload Verification Goal",
  "## Local Sandbox Artifact Source",
  "## Verification Steps",
  "## Manifest/Checksum Rules",
  "## Secret Scan Rules",
  "## Failure Handling",
  "## What This Proves",
  "## What This Does Not Prove",
  "## PASS/FAIL Criteria",
  "## Phase 35 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY",
  "fixtures/backup-sandbox/adapter/sample-family.fixture.json",
  "fixtures/backup-sandbox/adapter/sample-family.manifest.fixture.json",
  "fixtures/backup-sandbox/adapter/adapter-index.fixture.json",
  "contains_real_data: false",
  "contains_secret: false",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "STORAGE_UPLOAD_VERIFY_DRY_RUN_ONLY",
  "adapter-index.fixture.json",
  "sample-family.fixture.json",
  "sample-family.manifest.fixture.json",
  "Cloud upload: SKIPPED",
  "Result: PASS",
]) {
  requireIncludes(verifyScript, token, `verify script ${token}`);
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
  "copyFileSync",
]) {
  rejectIncludes(verifyScript, forbidden, `verify script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:storage-upload-verification-dry-run"] !== "node scripts/check-storage-upload-verification-dry-run.cjs") {
    failures.push("package.json missing check:storage-upload-verification-dry-run script");
  }
  if (scripts["backup:storage:verify-upload:dry-run"] !== "node scripts/verify-storage-upload-dry-run.cjs") {
    failures.push("package.json missing backup:storage:verify-upload:dry-run script");
  }
}

for (const [relativePath, content] of [
  ["docs/35_STORAGE_UPLOAD_VERIFICATION_DRY_RUN.md", doc],
  ["scripts/verify-storage-upload-dry-run.cjs", verifyScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Storage upload verification dry-run check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Storage upload verification dry-run check passed.");
