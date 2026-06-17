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

const doc = readFile("docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md");
const dryRunScript = readFile("scripts/backup-dry-run.cjs");

for (const section of [
  "## Production Baseline",
  "## Dry-Run Goal",
  "## Dry-Run Command Scope",
  "## Manifest Shape Requirement",
  "## Naming Convention Requirement",
  "## Secret Safety Scan",
  "## Restore Compatibility Simulation",
  "## PASS/FAIL Criteria",
  "## Future Implementation Path",
  "## Operational Usage",
  "## Phase 22 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section);
}

for (const token of [
  "BACKUP_DRY_RUN_COMMAND_DESIGN_BASELINE",
  "DRY_RUN_ONLY",
  "web-gia-pha",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  "Phase 21 status: PASS_WITH_NOTES",
  "GIA_PHA_GITHUB_MENU.bat",
  "gia-pha-backup-YYYYMMDD-HHMM-dry-run.json",
  "Manifest shape: PASS",
  "Naming convention: PASS",
  "Secret pattern scan: PASS",
  "Restore compatibility checklist: PASS",
  "Do not call production API/DB/network",
  "Do not commit `GIA_PHA_GITHUB_MENU.bat`",
]) {
  requireIncludes(doc, token);
}

for (const token of ["DRY_RUN_ONLY", "No production API calls.", "Result: PASS"]) {
  requireIncludes(dryRunScript, token, `backup-dry-run ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  "supabase",
  ".env.local",
  ".dev.vars",
  "CLOUDFLARE_API_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  if (dryRunScript.includes(forbidden)) {
    failures.push(`backup-dry-run contains forbidden token ${forbidden}`);
  }
}

const packageJsonRaw = readFile("package.json");
const packageJson = packageJsonRaw ? JSON.parse(packageJsonRaw) : {};
const scripts = packageJson.scripts || {};

if (
  scripts["check:backup-dry-run-command-design"] !==
  "node scripts/check-backup-dry-run-command-design.cjs"
) {
  failures.push("package.json missing script check:backup-dry-run-command-design");
}

if (scripts["backup:dry-run"] !== "node scripts/backup-dry-run.cjs") {
  failures.push("package.json missing script backup:dry-run");
}

for (const file of [
  "docs/22_BACKUP_DRY_RUN_COMMAND_DESIGN.md",
  "scripts/check-backup-dry-run-command-design.cjs",
  "scripts/backup-dry-run.cjs",
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
  console.error("Backup dry-run command design check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup dry-run command design check passed.");
