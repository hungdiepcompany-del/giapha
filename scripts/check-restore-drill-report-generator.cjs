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

const doc = readFile("docs/30_RESTORE_DRILL_REPORT_GENERATOR.md");
const reportScript = readFile("scripts/generate-restore-drill-report.cjs");
const packageJson = readJson("package.json");
const report = readJson("fixtures/backup/reports/sample-restore-drill-report.fixture.json");

for (const section of [
  "## Production Baseline",
  "## Restore Drill Report Goal",
  "## Report Fields",
  "## Fixture-Only Policy",
  "## Operational Usage",
  "## PASS/FAIL Criteria",
  "## Phase 30 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "RESTORE_DRILL_REPORT_GENERATOR_BASELINE",
  "RESTORE_DRILL_REPORT_ONLY",
  "sample-restore-drill-report.fixture.json",
  "noProductionMutation",
  "Do not hardcode secret/token/key values",
]) {
  requireIncludes(doc, token);
}

for (const token of [
  "RESTORE_DRILL_REPORT_ONLY",
  "sample-restore-drill-report.fixture.json",
  "noProductionMutation",
  "restoreExecution",
  "Result: PASS",
]) {
  requireIncludes(reportScript, token, `report script ${token}`);
}

for (const forbidden of [
  "fetch(",
  "createClient",
  ".env.local",
  ".dev.vars",
  "XMLHttpRequest",
  "wrangler",
  "insert(",
  "upsert(",
  "delete(",
]) {
  rejectIncludes(reportScript, forbidden, `report script ${forbidden}`);
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:restore-drill-report-generator"] !== "node scripts/check-restore-drill-report-generator.cjs") {
    failures.push("package.json missing check:restore-drill-report-generator script");
  }
  if (scripts["restore:drill:report"] !== "node scripts/generate-restore-drill-report.cjs") {
    failures.push("package.json missing restore:drill:report script");
  }
}

if (report) {
  if (report.marker !== "RESTORE_DRILL_REPORT_ONLY") {
    failures.push("report marker mismatch");
  }
  if (!["fixture", "fixture-dry-run", "dry-run"].includes(report.environment)) {
    failures.push("report environment must be fixture/dry-run");
  }
  if (report.noProductionMutation !== true) {
    failures.push("report noProductionMutation must be true");
  }
  if (report.restoreExecution !== "SKIPPED") {
    failures.push("report restoreExecution must be SKIPPED");
  }
  if (report.result !== "PASS") {
    failures.push("report result must be PASS");
  }
}

for (const [relativePath, content] of [
  ["docs/30_RESTORE_DRILL_REPORT_GENERATOR.md", doc],
  ["scripts/generate-restore-drill-report.cjs", reportScript],
]) {
  scanForSecretPatterns(relativePath, content);
}

if (failures.length > 0) {
  console.error("Restore drill report generator check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Restore drill report generator check passed.");
