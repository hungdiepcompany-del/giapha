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

const doc = readFile("docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md");

for (const section of [
  "## Production Baseline",
  "## Backup Hardening Checklist",
  "## Restore Readiness Checklist",
  "## Domain Hardening Checklist",
  "## Alerting Hardening Checklist",
  "## Incident Response Matrix",
  "## Backup Naming Convention",
  "## Environment And Secret Safety",
  "## Phase 18 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "family.json",
  "full-backup.zip",
  "gia-pha-backup-YYYYMMDD-HHMM-production.json",
  "Do not deploy in Phase 18",
  "Do not change schema",
  "Do not create or run migrations",
  "Do not mutate real data",
  "Do not create real production backup/export files",
  "Do not change the real domain",
  "Do not change Supabase/Auth/OAuth production config",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:backup-domain-alerting-hardening"] !==
  "node scripts/check-backup-domain-alerting-hardening.cjs"
) {
  failures.push("package.json missing script check:backup-domain-alerting-hardening");
}

for (const file of [
  "docs/18_BACKUP_DOMAIN_ALERTING_HARDENING.md",
  "scripts/check-backup-domain-alerting-hardening.cjs",
]) {
  const content = readFile(file);

  for (const pattern of [
    /sb_secret_[A-Za-z0-9_-]+/i,
    /eyJ[A-Za-z0-9_-]{20,}/,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,
    /GOOGLE_CLIENT_SECRET\s*=\s*["'][^"']+["']/,
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
  console.error("Backup domain alerting hardening check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup domain alerting hardening check passed.");
