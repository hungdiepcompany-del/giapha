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

const doc = readFile("docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Selection Goal",
  "## Storage Candidates",
  "## Evaluation Criteria",
  "## Candidate Comparison Matrix",
  "## Recommended Sandbox Target",
  "## Secret/Env Placeholders",
  "## Sandbox Prototype Boundary",
  "## Production Storage Boundary",
  "## Risk Matrix",
  "## Acceptance Criteria",
  "## Phase 32 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "Cloudflare R2",
  "Google Drive",
  "Supabase Storage",
  "Local/NAS/offline operator storage",
  "Manual encrypted offline backup",
  "Privacy/safety",
  "Long-term maintainability",
  "Cost",
  "Restore reliability",
  "Access control",
  "Secret management",
  "Automation readiness",
  "Vendor lock-in",
  "Ease of operator use",
  "100-year family archive goal",
  "Default sandbox/prototype target: continue using local sandbox storage",
  "Production long-term target: not selected",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "Do not read `.env.local`",
  "Do not read `.dev.vars`",
  "Do not call production API/DB/network",
  "Do not call Cloudflare/Supabase/Google API",
  "Do not create/upload production backup files",
  "Do not restore production",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "googleapis",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `Phase 32 doc ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:sandbox-storage-target-selection"] !== "node scripts/check-sandbox-storage-target-selection.cjs") {
    failures.push("package.json missing check:sandbox-storage-target-selection script");
  }
}

scanForSecretPatterns("docs/32_SANDBOX_STORAGE_TARGET_SELECTION.md", doc);

if (failures.length > 0) {
  console.error("Sandbox storage target selection check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sandbox storage target selection check passed.");
