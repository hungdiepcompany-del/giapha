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

const doc = readFile("docs/31_BACKUP_READINESS_HANDOFF.md");
const packageJson = readJson("package.json");

for (const section of [
  "## Current Production Baseline",
  "## Phase 18-31 Summary",
  "## Commands Available",
  "## CI Workflow Available",
  "## Fixture Files Available",
  "## What Is Safe Now",
  "## What Is Still Not Production Backup",
  "## Known Notes",
  "## Boundary",
  "## Recommended Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const command of [
  "npm run backup:dry-run",
  "npm run backup:fixture:generate",
  "npm run backup:fixture:verify",
  "npm run restore:dry-run",
  "npm run backup:pipeline:readiness",
  "npm run backup:storage:sandbox",
  "npm run backup:retention:check",
  "npm run restore:drill:report",
]) {
  requireIncludes(doc, command, `handoff command ${command}`);
}

for (const token of [
  "BACKUP_READINESS_HANDOFF_BASELINE",
  "No production backup exists",
  "No real storage upload exists",
  "No cron or scheduled backup exists",
  "No production restore exists",
  "No GitHub `secrets.*` dependency",
  "Do not call production API/DB/network",
  "Do not hardcode secret/token/key values",
  "Do not deploy",
  "Do not push",
]) {
  requireIncludes(doc, token);
}

for (const forbidden of [
  "schedule:",
  "wrangler deploy",
  "opennextjs-cloudflare deploy",
  "supabase db push",
]) {
  rejectIncludes(doc, forbidden, `handoff doc ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-readiness-handoff"] !== "node scripts/check-backup-readiness-handoff.cjs") {
    failures.push("package.json missing check:backup-readiness-handoff script");
  }
}

scanForSecretPatterns("docs/31_BACKUP_READINESS_HANDOFF.md", doc);

if (failures.length > 0) {
  console.error("Backup readiness handoff check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Backup readiness handoff check passed.");
