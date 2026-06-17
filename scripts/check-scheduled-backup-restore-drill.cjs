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

const doc = readFile("docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md");

for (const section of [
  "## Production Baseline",
  "## Drill Goal",
  "## Recommended Backup Schedule",
  "## Backup Scope",
  "## Backup Naming Convention",
  "## Backup Manifest Template",
  "## Restore Drill Scope",
  "## Restore Verification Checklist",
  "## PASS/FAIL Criteria",
  "## Drill Log Template",
  "## Scheduled Reminder Strategy",
  "## Incident Response",
  "## Gaps And Future Work",
  "## Phase 19 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "SCHEDULED_BACKUP_RESTORE_DRILL_BASELINE",
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "Phase 18 status: PASS_WITH_NOTES",
  "GIA_PHA_GITHUB_MENU.bat",
  "gia-pha-backup-YYYYMMDD-HHMM-production-manifest.json",
  "\"project\": \"gia-pha\"",
  "\"contains_secret\": false",
  "Restore drill runs in a non-production environment",
  "No production mutation occurs",
  "Do not deploy in Phase 19",
  "Do not create or run migrations",
  "Do not create real production backup files",
  "Do not restore production",
  "Do not change Supabase/Auth/OAuth production config",
  "Do not hardcode secret/token/key values",
  "Do not commit `GIA_PHA_GITHUB_MENU.bat`",
]) {
  requireIncludes(doc, token);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:scheduled-backup-restore-drill"] !==
  "node scripts/check-scheduled-backup-restore-drill.cjs"
) {
  failures.push("package.json missing script check:scheduled-backup-restore-drill");
}

for (const file of [
  "docs/19_SCHEDULED_BACKUP_RESTORE_DRILL.md",
  "scripts/check-scheduled-backup-restore-drill.cjs",
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
  console.error("Scheduled backup restore drill check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Scheduled backup restore drill check passed.");
