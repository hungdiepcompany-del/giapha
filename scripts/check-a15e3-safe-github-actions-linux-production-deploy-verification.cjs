const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const phase = "A-15E3";
const marker = "A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION";
const docPath =
  "docs/PLAN_A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION.md";
const checkerPath =
  "scripts/check-a15e3-safe-github-actions-linux-production-deploy-verification.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  "package.json",
  "scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs",
  "scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs",
  checkerPath,
]);

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

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

function gitOutput(args) {
  try {
    return childProcess.execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`git ${args.join(" ")} failed`);
    return "";
  }
}

function gitShowHead(relativePath) {
  try {
    return childProcess.execFileSync("git", ["show", `HEAD:${relativePath}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

const packageJson = readJson("package.json");
const doc = readFile(docPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const deployWorkflow = readFile(".github/workflows/cloudflare-deploy.yml");
const buildGateWorkflow = readFile(".github/workflows/opennext-build-gate.yml");

for (const token of [
  "A-15E3 - Safe GitHub Actions Linux Production Deploy Verification",
  phase,
  marker,
  "workflow_dispatch",
  "ubuntu-latest",
  "npm run deploy",
  "WINDOWS_OPENNEXT_DEPLOY_INCIDENT=500_ALL_MAIN_ROUTES",
  "ROLLBACK_VERSION=4134298b-ef89-4099-b20b-b13995f397c8",
  "CLOUDFLARE_DEPLOY_AUTO_ON_PUSH=false",
  "DEPLOY_FROM_WINDOWS_ALLOWED=false",
  "GITHUB_ACTIONS_NODE_WARNING_CLASSIFICATION=NON_BLOCKING_GITHUB_ACTIONS_RUNNER_ADVISORY_IF_WORKFLOW_SUCCESS",
  "A15E3_STATUS=PASS_GITHUB_ACTIONS_LINUX_DEPLOY_VERIFIED",
  "ROUTE_/=200",
  "ROUTE_/tree=200",
  "ROUTE_/auth/login=200",
  "ROUTE_/admin=307_REDIRECT_LOGIN",
  "CURRENT_ACTIVE_VERSION=f8287634-ecfa-45f6-ac8a-d519e1b4e30b",
  "AUTO_DEPLOY_ON_PUSH=false",
  "no deploy rerun",
  "no automatic rollback",
  "no secret value log",
  "no dependency",
  "no OpenNext/Wrangler config change",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const route of ["/", "/tree", "/auth/login", "/admin"]) {
  requireIncludes(doc, route, `route ${route}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION.md", "index entry"],
  [workLog, "A-15E3 - Safe GitHub Actions Linux Production Deploy Verification", "work log entry"],
  [handoff, "A-15E3 - Safe GitHub Actions Linux Production Deploy Verification recorded", "handoff entry"],
  [decisionLog, "Decision 192 - A-15E3 standardizes manual GitHub Actions Linux deploy verification", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15e3:safe-github-actions-linux-production-deploy-verification"] !==
  "node scripts/check-a15e3-safe-github-actions-linux-production-deploy-verification.cjs"
) {
  failures.push("missing package script check:a15e3:safe-github-actions-linux-production-deploy-verification");
}

for (const [content, token, label] of [
  [deployWorkflow, "workflow_dispatch:", "deploy workflow dispatch trigger"],
  [deployWorkflow, "runs-on: ubuntu-latest", "deploy workflow ubuntu runner"],
  [deployWorkflow, "node-version: '24'", "deploy workflow Node 24"],
  [deployWorkflow, "CLOUDFLARE_API_TOKEN", "Cloudflare token contract"],
  [deployWorkflow, "CLOUDFLARE_ACCOUNT_ID", "Cloudflare account contract"],
  [deployWorkflow, "NEXT_PUBLIC_SUPABASE_URL", "Supabase URL contract"],
  [deployWorkflow, "NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon contract"],
  [deployWorkflow, "NEXT_PUBLIC_APP_URL", "app URL contract"],
  [deployWorkflow, "SUPABASE_SERVICE_ROLE_KEY", "service role contract"],
  [deployWorkflow, "run: npm run deploy", "deploy command"],
  [buildGateWorkflow, "push:", "build gate push trigger"],
  [buildGateWorkflow, "runs-on: ubuntu-latest", "build gate ubuntu runner"],
  [buildGateWorkflow, "node-version: '24'", "build gate Node 24"],
  [buildGateWorkflow, "npx opennextjs-cloudflare build", "build gate OpenNext build"],
]) {
  requireIncludes(content, token, label);
}

rejectIncludes(deployWorkflow, "push:", "Cloudflare Deploy auto deploy on push");
rejectIncludes(deployWorkflow, "pull_request:", "Cloudflare Deploy pull request trigger");
rejectIncludes(buildGateWorkflow, "npm run deploy", "OpenNext Build Gate deploy command");

const changedFiles = gitOutput(["status", "--porcelain"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local") failures.push(".env.local must not be changed");
  if (file === "PLANNING.MD") failures.push("PLANNING.MD must not be changed");
  if (file.startsWith("db/") || file.endsWith(".sql")) {
    failures.push(`database/sql file changed ${file}`);
  }
  if (/schema|migration|seed/i.test(file) && !file.startsWith("docs/")) {
    failures.push(`schema/migration/seed-like file changed ${file}`);
  }
  if (
    /wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config|\.github\/workflows/i.test(
      file,
    )
  ) {
    failures.push(`Worker/OpenNext/Wrangler/GitHub workflow config file changed ${file}`);
  }
  if (
    file.startsWith("app/api/") ||
    file.startsWith("lib/") ||
    file.startsWith("server/") ||
    file.startsWith("services/") ||
    file.startsWith("pages/")
  ) {
    failures.push(`API/service/runtime file changed ${file}`);
  }
  if (/storage-state|storage_state|cookie|token|secret|\.env|\.png$|\.jpg$|\.jpeg$|\.webp$/i.test(file)) {
    failures.push(`possible secret/session/evidence artifact changed ${file}`);
  }
}

const packageHead = gitShowHead("package.json");
if (packageHead) {
  const before = JSON.parse(packageHead);
  const beforeDeps = JSON.stringify(before.dependencies ?? {});
  const afterDeps = JSON.stringify(packageJson.dependencies ?? {});
  const beforeDevDeps = JSON.stringify(before.devDependencies ?? {});
  const afterDevDeps = JSON.stringify(packageJson.devDependencies ?? {});

  if (beforeDeps !== afterDeps || beforeDevDeps !== afterDevDeps) {
    failures.push("dependency drift detected");
  }
}

for (const configPath of [
  "wrangler.toml",
  "open-next.config.ts",
  "next.config.ts",
  ".github/workflows/cloudflare-deploy.yml",
  ".github/workflows/opennext-build-gate.yml",
]) {
  const head = gitShowHead(configPath);
  const current = readFile(configPath);
  if (head && current && head.replace(/\r\n/g, "\n") !== current.replace(/\r\n/g, "\n")) {
    failures.push(`${configPath} changed`);
  }
}

for (const pattern of [
  /\bCREATE\s+TABLE\b/i,
  /\bALTER\s+TABLE\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /\bCREATE\s+POLICY\b/i,
  /\bALTER\s+POLICY\b/i,
  /sb_(secret|service)_[A-Za-z0-9_-]{12,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{12,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]) {
  rejectPattern(doc, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15E3 safe GitHub Actions Linux production deploy verification check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15E3 safe GitHub Actions Linux production deploy verification check passed.");
