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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) {
    failures.push(`missing ${label}`);
  }
}

const doc = readFile("docs/17_PRODUCTION_OPERATIONS_MONITORING.md");

for (const section of [
  "## Production Baseline",
  "## Post-Deploy Operations Checklist",
  "## Cloudflare Monitoring Checklist",
  "## GitHub Actions Monitoring Checklist",
  "## Supabase/Auth Monitoring Checklist",
  "## Smoke Testing Guide",
  "## Incident Triage Runbook",
  "## Rollback Guidance",
  "## Boundary",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "PROD_SMOKE_BASE_URL",
  "Do not deploy in Phase 17",
  "Do not change schema",
  "Do not create or run migrations",
  "Do not mutate real data",
  "Do not hardcode secret/token/key values",
  "Do not commit `.env.local` or `.dev.vars`",
]) {
  requireIncludes(doc, token);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:production-ops-monitoring"] !==
  "node scripts/check-production-ops-monitoring.cjs"
) {
  failures.push("package.json missing script check:production-ops-monitoring");
}

const index = readFile("docs/00_INDEX.md");
requireIncludes(index, "17_PRODUCTION_OPERATIONS_MONITORING.md");

const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
requireIncludes(handoff, "Phase 17 Production Operations & Monitoring");

for (const file of [
  "docs/17_PRODUCTION_OPERATIONS_MONITORING.md",
  "scripts/check-production-ops-monitoring.cjs",
]) {
  const content = readFile(file);

  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_API_TOKEN\s*=\s*["'][^"']+["']/,
    /CLOUDFLARE_ACCOUNT_ID\s*=\s*["'][^"']+["']/,
  ]) {
    if (pattern.test(content)) {
      failures.push(`${file} appears to contain a plaintext secret/token/key`);
      break;
    }
  }
}

if (failures.length > 0) {
  console.error("Production operations monitoring check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Production operations monitoring check passed.");
