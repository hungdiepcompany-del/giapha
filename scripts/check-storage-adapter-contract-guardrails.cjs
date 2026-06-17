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

const doc = readFile("docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md");
const contractScript = readFile("scripts/backup-storage-adapter-contract.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Adapter Contract Goal",
  "## Supported Future Providers",
  "## Adapter Method Contract",
  "## Manifest Requirements",
  "## Upload Contract",
  "## Verify Contract",
  "## List Contract",
  "## Delete/Retention Safety Contract",
  "## Secret/Env Boundary",
  "## Provider-Specific Risks",
  "## No-Network Policy For Phase 33",
  "## Acceptance Criteria",
  "## Phase 33 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "putBackupArtifact(input)",
  "getBackupArtifactMetadata(input)",
  "listBackupArtifacts(input)",
  "verifyBackupArtifact(input)",
  "deleteBackupArtifact(input)",
  "Cloudflare R2 adapter",
  "Google Drive adapter",
  "Supabase Storage adapter",
  "No provider SDK",
  "No network request",
  "No storage upload",
  "No storage delete",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

requireIncludes(contractScript, "STORAGE_ADAPTER_CONTRACT_ONLY", "contract marker");

for (const forbidden of [
  "fetch(",
  "createClient",
  "wrangler",
  "googleapis",
  "supabase",
  ".env.local",
  ".dev.vars",
  "XMLHttpRequest",
  "http.request",
  "https.request",
  "copyFileSync",
  "unlink",
  "rmSync",
]) {
  rejectIncludes(contractScript, forbidden, `contract script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:storage-adapter-contract-guardrails"] !== "node scripts/check-storage-adapter-contract-guardrails.cjs") {
    failures.push("package.json missing check:storage-adapter-contract-guardrails script");
  }
  if (scripts["backup:storage:contract"] !== "node scripts/backup-storage-adapter-contract.cjs") {
    failures.push("package.json missing backup:storage:contract script");
  }
}

for (const [relativePath, content] of [
  ["docs/33_STORAGE_ADAPTER_CONTRACT_GUARDRAILS.md", doc],
  ["scripts/backup-storage-adapter-contract.cjs", contractScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Storage adapter contract guardrails check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Storage adapter contract guardrails check passed.");
