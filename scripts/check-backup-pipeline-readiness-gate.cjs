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

const doc = readFile("docs/26_BACKUP_PIPELINE_READINESS_GATE.md");
const pipelineScript = readFile("scripts/backup-pipeline-readiness.cjs");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Pipeline Goal",
  "## Pipeline Steps",
  "## Command",
  "## Safety Boundary",
  "## Secret/Privacy Guardrails",
  "## PASS/FAIL Criteria",
  "## Phase 26 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "BACKUP_PIPELINE_READINESS_GATE_BASELINE",
  "PIPELINE_READINESS_ONLY",
  "backup:dry-run",
  "backup:fixture:generate",
  "backup:fixture:verify",
  "restore:dry-run",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "PIPELINE_READINESS_ONLY",
  "backup:dry-run",
  "backup:fixture:generate",
  "backup:fixture:verify",
  "restore:dry-run",
  "Result: PASS",
]) {
  requireIncludes(pipelineScript, token, `pipeline script ${token}`);
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
  "git push",
  "npx",
]) {
  if (pipelineScript.includes(forbidden)) {
    failures.push(`pipeline script contains forbidden token ${forbidden}`);
  }
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-pipeline-readiness-gate"] !== "node scripts/check-backup-pipeline-readiness-gate.cjs") {
    failures.push("package.json missing check:backup-pipeline-readiness-gate script");
  }
  if (scripts["backup:pipeline:readiness"] !== "node scripts/backup-pipeline-readiness.cjs") {
    failures.push("package.json missing backup:pipeline:readiness script");
  }
}

for (const [relativePath, content] of [
  ["docs/26_BACKUP_PIPELINE_READINESS_GATE.md", doc],
  ["scripts/backup-pipeline-readiness.cjs", pipelineScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Backup pipeline readiness gate check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup pipeline readiness gate check passed.");
