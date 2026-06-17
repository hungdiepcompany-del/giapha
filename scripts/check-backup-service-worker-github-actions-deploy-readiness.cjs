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
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectIncludes(content, token, label = token) {
  if (content.includes(token)) failures.push(`forbidden ${label}`);
}

const doc = readFile("docs/48_BACKUP_SERVICE_WORKER_GITHUB_ACTIONS_DEPLOY_WORKFLOW_READINESS.md");
const workflow = readFile(".github/workflows/backup-service-deploy.yml");
const packageJson = readJson("package.json");

for (const section of [
  "## Production Baseline",
  "## Backup Service Baseline",
  "## Workflow Readiness Goal",
  "## Manual-Only Trigger",
  "## Required GitHub Secrets Placeholders",
  "## Required Checks Before Deploy",
  "## Deploy Job Safety",
  "## No-Schedule Policy",
  "## No-Auto-Push Policy",
  "## Rollback Notes",
  "## Phase 48 Boundary",
  "## Next Phase",
]) {
  requireIncludes(doc, section, `doc section ${section}`);
}

for (const token of [
  "manual-only",
  "workflow_dispatch",
  "secrets.CLOUDFLARE_API_TOKEN",
  "secrets.CLOUDFLARE_ACCOUNT_ID",
  "services/backup-service",
  "npx wrangler deploy",
  "No deploy",
  "No schedule",
  "No-Auto-Push Policy",
]) {
  requireIncludes(doc, token);
}

requireIncludes(workflow, "name: Backup Service Deploy");
requireIncludes(workflow, "workflow_dispatch:");
requireIncludes(workflow, "Manual only");
requireIncludes(workflow, "secrets.CLOUDFLARE_API_TOKEN");
requireIncludes(workflow, "secrets.CLOUDFLARE_ACCOUNT_ID");
requireIncludes(workflow, "npm run check:backup-service-worker-deploy-readiness");
requireIncludes(workflow, "npm run check:backup-service-worker-env-secret-contract");
requireIncludes(workflow, "npm run check:backup-service-worker-post-deploy-smoke-plan");
requireIncludes(workflow, "npm run check:backup-service-worker-main-app-binding-contract");
requireIncludes(workflow, "working-directory: services/backup-service");
requireIncludes(workflow, "npx wrangler deploy");

for (const forbidden of [
  "schedule:",
  "push:",
  "pull_request:",
  "npm run deploy",
  "opennextjs-cloudflare deploy",
  "working-directory: .",
]) {
  rejectIncludes(workflow, forbidden, `workflow ${forbidden}`);
}

for (const forbiddenSecretPattern of [
  /CLOUDFLARE_API_TOKEN:\s*['"][^$][^'"]+['"]/,
  /CLOUDFLARE_ACCOUNT_ID:\s*['"][^$][^'"]+['"]/,
  /BACKUP_SERVICE_INTERNAL_TOKEN:\s*['"][^$][^'"]+['"]/,
  /eyJ[A-Za-z0-9_-]{20,}/,
  /[A-Za-z0-9_-]{32,}\.[A-Za-z0-9_-]{32,}/,
]) {
  if (forbiddenSecretPattern.test(workflow)) {
    failures.push(`workflow appears to contain a hardcoded secret: ${forbiddenSecretPattern}`);
  }
}

const deployIndex = workflow.indexOf("npx wrangler deploy");
const checkIndex = workflow.indexOf("npm run check:backup-service-worker-deploy-readiness");
if (deployIndex >= 0 && checkIndex >= 0 && checkIndex > deployIndex) {
  failures.push("deploy readiness check must run before wrangler deploy");
}

if (packageJson) {
  const scripts = packageJson.scripts || {};
  if (scripts["check:backup-service-worker-github-actions-deploy-readiness"] !== "node scripts/check-backup-service-worker-github-actions-deploy-readiness.cjs") {
    failures.push("package.json missing check:backup-service-worker-github-actions-deploy-readiness script");
  }
}

if (failures.length > 0) {
  console.error("Backup service worker GitHub Actions deploy readiness check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Backup service worker GitHub Actions deploy readiness check passed.");
