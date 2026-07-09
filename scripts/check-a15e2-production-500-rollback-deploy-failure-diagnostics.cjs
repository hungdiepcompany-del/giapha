const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];
const marker = "A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS";
const docPath =
  "docs/PLAN_A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS.md";
const checkerPath =
  "scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs";

const allowedChangedFiles = new Set([
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  docPath,
  "docs/PLAN_A15E3_SAFE_GITHUB_ACTIONS_LINUX_PRODUCTION_DEPLOY_VERIFICATION.md",
  "package.json",
  "scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs",
  "scripts/check-a15e3-safe-github-actions-linux-production-deploy-verification.cjs",
  ".github/workflows/cloudflare-deploy.yml",
  "docs/PLAN_A16AX_CLOUDFLARE_RUNTIME_VARS_PRESERVATION_DEPLOY_WIRING.md",
  "scripts/check-a16ax-cloudflare-runtime-vars-preservation-deploy-wiring.cjs",
  "scripts/check-a16aw-runtime-env-flag-propagation-diagnosis.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16au-github-actions-runtime-env-flag-wiring.cjs",
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
const a15eChecker = readFile(
  "scripts/check-a15e-heritage-ui-production-deploy-readiness-smoke.cjs",
);

for (const token of [
  "A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics",
  marker,
  "DIAGNOSTICS_ONLY_RECORDED_LOCAL",
  "FAILED_DEPLOY_ROUTE_/=500",
  "FAILED_DEPLOY_ROUTE_/tree=500",
  "FAILED_DEPLOY_ROUTE_/auth/login=500",
  "FAILED_DEPLOY_ROUTE_/admin=500",
  "ROLLBACK_VERSION=4134298b-ef89-4099-b20b-b13995f397c8",
  "ROLLBACK_STATUS=OWNER_CONFIRMED_SUCCESS",
  "POST_ROLLBACK_/=200",
  "POST_ROLLBACK_/tree=200",
  "POST_ROLLBACK_/auth/login=200",
  "GIT_STATUS=PASS_SYNCED_CLEAN",
  "WRANGLER_DEPLOYMENTS_LIST_STATUS=PASS_READ_ONLY",
  "WRANGLER_SECRET_LIST_STATUS=PASS_NAMES_ONLY",
  "SECRET_NAME_PRESENT=SUPABASE_SERVICE_ROLE_KEY",
  "SECRET_VALUE_LOGGED=NO",
  "PRODUCTION_STATUS_AFTER_ROLLBACK=PASS_PUBLIC_ROUTES",
  "STANDARD_DEPLOY_SCRIPT_PRESENT=true",
  "DEPLOY_FROM_WINDOWS=NO_UNLESS_OWNER_APPROVES_AND_OPENNEXT_WARNING_IS_CLOSED",
  "NEXT_PHASE=A-15E3",
  "no deploy rerun",
  "no extra rollback while production is already 200",
  "no DB migration",
  "no secret value log",
  "no dependency",
  "no OpenNext/Wrangler config change without owner approval",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "Windows OpenNext runtime bundle issue",
  "Missing or mismatched production vars/secrets",
  "Wrong deploy command/order",
  "Stale or incompatible `.open-next` output",
  "Wrangler/OpenNext version mismatch",
  "GitHub Actions Linux or WSL",
]) {
  requireIncludes(doc, token, `cause/recommendation ${token}`);
}

for (const route of ["/", "/tree", "/auth/login", "/admin"]) {
  requireIncludes(doc, route, `route ${route}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A15E2_PRODUCTION_500_ROLLBACK_DEPLOY_FAILURE_DIAGNOSTICS.md", "index entry"],
  [workLog, "A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics", "work log entry"],
  [handoff, "A-15E2 - Production 500 Rollback & Deploy Failure Diagnostics recorded", "handoff entry"],
  [decisionLog, "Decision 191 - A-15E2 blocks Windows redeploy after production 500 rollback", "decision log entry"],
  [workLog, marker, "work log marker"],
  [handoff, marker, "handoff marker"],
  [a15eChecker, docPath, "A-15E checker allows A-15E2 doc"],
  [a15eChecker, checkerPath, "A-15E checker allows A-15E2 checker"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.["check:a15e2:production-500-rollback-deploy-failure-diagnostics"] !==
  "node scripts/check-a15e2-production-500-rollback-deploy-failure-diagnostics.cjs"
) {
  failures.push("missing package script check:a15e2:production-500-rollback-deploy-failure-diagnostics");
}

if (
  packageJson?.scripts?.deploy !== "opennextjs-cloudflare build && opennextjs-cloudflare deploy" &&
  packageJson?.scripts?.deploy !== "opennextjs-cloudflare build && opennextjs-cloudflare deploy -- --keep-vars"
) {
  failures.push("standard deploy script drifted");
}

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
    /wrangler\.toml|wrangler\.json|wrangler\.jsonc|open-next\.config|opennext|cloudflare-env|middleware|next\.config/i.test(
      file,
    ) &&
    file !== "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs"
  ) {
    failures.push(`Worker/OpenNext/Wrangler/runtime config file changed ${file}`);
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

for (const configPath of ["wrangler.toml", "open-next.config.ts", "next.config.ts"]) {
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
]) {
  rejectPattern(doc, pattern, pattern.toString());
}

if (failures.length > 0) {
  console.error("A-15E2 production 500 rollback deploy failure diagnostics check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-15E2 production 500 rollback deploy failure diagnostics check passed.");
