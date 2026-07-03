const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md";
const pushDeployDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md";
const packagePath = "package.json";
const wranglerPath = "wrangler.toml";
const workflowPath = ".github/workflows/cloudflare-deploy.yml";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    failures.push(`${relativePath} is not valid JSON`);
    return null;
  }
}

function git(args) {
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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = read(docPath);
const pushDeployDoc = read(pushDeployDocPath);
const wrangler = read(wranglerPath);
const workflow = read(workflowPath);
const service = read(servicePath);
const route = read(routePath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-GIAPHA-CLOUDFLARE-ACCOUNT-RECOVERY",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_STATUS=BLOCKED_WRONG_OR_UNVERIFIED_CLOUDFLARE_ACCOUNT",
  "CLOUDFLARE_ACCOUNT_MATCH=NO",
  "TARGET_WORKER_FOUND=NO",
  "DEPLOY_ALLOWED_NEXT=NO",
  "DEPLOY_BLOCKER=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT",
  "REQUIRED_OWNER_ACTION=LOGIN_TO_CORRECT_GIAPHA_CLOUDFLARE_ACCOUNT_OR_PROVIDE_GITHUB_ACTIONS_DEPLOY_EVIDENCE_FOR_WEB_GIA_PHA",
  "2e223c1f9969bd7698a5ec43f32e54895fe",
  "main...origin/main [ahead 1]",
  "web-gia-pha",
  ".open-next/worker.js",
  "https://web-gia-pha.hungdiepcompany.workers.dev/",
  ".github/workflows/cloudflare-deploy.yml",
  "workflow_dispatch",
  "GIA_PHA_CLOUDFLARE_ACCOUNT_ID_DOCUMENTED=UNKNOWN_NOT_DOCUMENTED_IN_REPO_DOCS",
  "4.100.0",
  "hung.pham@longthaisteel.com",
  "dec1eb5cfb3f4b32956b1aff723e5ace",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_WRANGLER_WHOAMI_STATUS=TIMEOUT",
  "Cloudflare API error: 10007: This Worker does not exist on your account.",
  "`bom`, `hrsync`, `san-xuat-lt`, `san-xuat-lt-google-drive-service`, `sx`",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_REASON=ACTIVE_ACCOUNT_LISTS_SAN_XUAT_LT_WORKERS_NOT_WEB_GIA_PHA",
  "It must not be used for a GIA",
  "Do not change `wrangler.toml` to match the current wrong account.",
  "Do not deploy",
  "GIA PHA to `sx`",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_RPC_DIRECT_CALLED=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_REAL_GENEALOGY_WRITE=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_DEPLOY_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_PUSH_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_SQL_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_DB_PUSH_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_MIGRATION_REPAIR_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_SEED_RUN=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_NEXT_GATE=WAIT_FOR_OWNER_CORRECT_ACCOUNT_OR_DEPLOY_EVIDENCE",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE_STATUS=BLOCKED_DEPLOY_TARGET_MISMATCH",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_DEPLOY_STATUS=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT",
]) {
  requireIncludes(pushDeployDoc, token, `push deploy doc token ${token}`);
}

requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler worker name");
requireIncludes(workflow, "workflow_dispatch:", "manual-only deploy workflow");
requireIncludes(workflow, "run: npm run deploy", "deploy command documented");
requireIncludes(service, "canRunOfficialImport: false", "service remains fail closed");
requireIncludes(route, "canRunOfficialImport: false", "route remains fail closed");

if (
  packageJson?.scripts?.["check:a16r-giapha-cloudflare-account-recovery"] !==
  "node scripts/check-a16r-giapha-cloudflare-account-recovery.cjs"
) {
  failures.push("missing package script check:a16r-giapha-cloudflare-account-recovery");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md", "index recovery entry"],
  [workLog, "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_STATUS=BLOCKED_WRONG_OR_UNVERIFIED_CLOUDFLARE_ACCOUNT", "work log recovery status"],
  [decisionLog, "A-16R Cloudflare account recovery blocks deploy until web-gia-pha is visible", "decision log recovery decision"],
  [handoff, "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY_STATUS=BLOCKED_WRONG_OR_UNVERIFIED_CLOUDFLARE_ACCOUNT", "handoff recovery status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [docPath, doc],
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}\/official-import/i, `${label} must not call official import`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
  rejectPattern(content, /canRunOfficialImport:\s*true/, `${label} must not open canRunOfficialImport`);
}

rejectPattern(doc, /deploy\s+GIA PHA\s+to\s+`?(bom|hrsync|san-xuat-lt|san-xuat-lt-google-drive-service|sx)`?\s+as\s+allowed/i, "must not allow using SAN XUAT LT account for GIA PHA deploy");
rejectPattern(doc + service + route, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  packagePath,
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(`forbidden env file ${file}`);
  if (file.startsWith("supabase/.temp/")) failures.push(`forbidden supabase temp ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`forbidden spreadsheet/csv ${file}`);
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden outside-scope file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R GIA PHA Cloudflare account recovery check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R GIA PHA Cloudflare account recovery check passed.");
