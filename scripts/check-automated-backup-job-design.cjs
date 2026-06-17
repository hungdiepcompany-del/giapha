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

const doc = readFile("docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md");

for (const section of [
  "## Production Baseline",
  "## Design Goal",
  "## Backup Job Candidate Architecture",
  "## Recommended Safe Architecture",
  "## Backup Trigger Design",
  "## Backup Output Design",
  "## Backup Storage Design",
  "## Retention Policy Design",
  "## Security And Privacy Guardrails",
  "## Job Failure Handling",
  "## Restore Compatibility Requirement",
  "## Future Implementation Stages",
  "## Configuration Variables Design",
  "## Acceptance Criteria",
  "## Phase 21 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "AUTOMATED_BACKUP_JOB_DESIGN_BASELINE",
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "Phase 20 status: PASS_WITH_NOTES",
  "GIA_PHA_GITHUB_MENU.bat",
  "buildFamilyJsonFile",
  "buildGedcomExport",
  "buildFullBackupZip",
  "GitHub Actions scheduled workflow",
  "Cloudflare Worker Cron Trigger",
  "Cloudflare R2",
  "Google Drive",
  "Supabase Storage",
  "BACKUP_JOB_ENABLED=false",
  "BACKUP_STORAGE_PROVIDER=<r2|google_drive|supabase_storage|manual>",
  "Do not create a real scheduled job",
  "Do not enable real cron",
  "Do not upload real backup files to storage",
  "Do not hardcode secret/token/key values",
  "Do not commit `GIA_PHA_GITHUB_MENU.bat`",
]) {
  requireIncludes(doc, token);
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:automated-backup-job-design"] !==
  "node scripts/check-automated-backup-job-design.cjs"
) {
  failures.push("package.json missing script check:automated-backup-job-design");
}

for (const file of [
  "docs/21_AUTOMATED_BACKUP_JOB_DESIGN.md",
  "scripts/check-automated-backup-job-design.cjs",
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
  console.error("Automated backup job design check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Automated backup job design check passed.");
