const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md";
const packagePath = "package.json";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const wranglerPath = "wrangler.toml";

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
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const route = read(routePath);
const service = read(servicePath);
const wrangler = read(wranglerPath);

for (const token of [
  "A-16R-GIAPHA-CLOUDFLARE-ACCOUNT-VERIFY-DEPLOY-SMOKE",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE_STATUS=BLOCKED_WRONG_CLOUDFLARE_ACCOUNT_TARGET_WORKER_NOT_FOUND",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_PREFLIGHT_STATUS=PASS",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_VALIDATION_STATUS=PASS_WITH_CLEAN_MIRROR_BUILD_CHECKOUT_NEXT_ACL_BLOCKED",
  "REMOTE_REPO_SLUG_MATCH=YES_SSH_ALIAS_ACCEPTED",
  "HEAD_EQUALS_ORIGIN_MAIN=YES",
  "WORKING_TREE_CLEAN=YES",
  "BUILD_STATUS=PASS_CLEAN_MIRROR_SOURCE_BUILD_CHECKOUT_ARTIFACT_ACL_BLOCKED",
  "CLOUDFLARE_ACCOUNT_MATCH=NO",
  "TARGET_WORKER_FOUND=NO",
  "DEPLOY_ALLOWED=NO",
  "DEPLOY_RESULT=BLOCKED",
  "PRODUCTION_POST_DEPLOY_SMOKE_RESULT=NOT_RUN_DEPLOY_BLOCKED",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "npx wrangler whoami",
  "hung.pham@longthaisteel.com",
  "dec1eb5cfb3f4b32956b1aff723e5ace",
  "WRANGLER_ACCOUNT_IS_PREVIOUS_BLOCKED_ACCOUNT=YES",
  "CURRENT_ACCOUNT_IS_NOT_PREVIOUS_WRONG_ACCOUNT=NO",
  "web-gia-pha",
  "npx wrangler deployments list --name web-gia-pha",
  "10007: This Worker does not exist on your account.",
  "TARGET_WORKER_CLASSIFICATION=BLOCKED_NOT_FOUND_IN_ACTIVE_ACCOUNT",
  "DEPLOY_COMMAND_RUN=NO",
  "DEPLOY_BLOCKER=BLOCKED_WRONG_CLOUDFLARE_ACCOUNT_TARGET_WORKER_NOT_FOUND",
  "RUNTIME_ENABLEMENT_MARKER_RECOGNIZED=UNKNOWN_DEPLOY_BLOCKED",
  "A16V_RECONCILIATION_EVIDENCE_RECOGNIZED=UNKNOWN_DEPLOY_BLOCKED",
  "PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=unknown",
  "PRODUCTION_OFFICIAL_IMPORT_BUTTON=unknown",
  "A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_IMPORT_RETRY_BLOCKER=DEPLOY_AND_POST_DEPLOY_SMOKE_NOT_PROVEN",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DIRECT_RPC_CALLED=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_REAL_GENEALOGY_WRITE=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_SQL_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DB_PUSH_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_MIGRATION_REPAIR_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_SEED_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_RUN=NO",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_WRANGLER_TOML_CHANGED=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
  "No real genealogy data write.",
  "Main Worker touched: NO",
  "Runtime dependency added: NO",
  "New service Worker created: NO",
  "OpenNext/Wrangler config changed: NO",
  "Worker size risk: NO",
  "Service boundary recommendation: NONE",
  "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_NEXT_GATE=WAIT_FOR_CORRECT_CLOUDFLARE_ACCOUNT_WITH_WEB_GIA_PHA",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler target worker name");
requireIncludes(route, "canRunOfficialImport: false", "route remains fail closed");
requireIncludes(service, "canRunOfficialImport: false", "service remains fail closed");

if (
  packageJson?.scripts?.["check:a16r-giapha-cloudflare-account-verify-deploy-smoke"] !==
  "node scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs"
) {
  failures.push("missing package script check:a16r-giapha-cloudflare-account-verify-deploy-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md", "index verify deploy smoke entry"],
  [
    workLog,
    "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE_STATUS=BLOCKED_WRONG_CLOUDFLARE_ACCOUNT_TARGET_WORKER_NOT_FOUND",
    "work log verify deploy smoke status",
  ],
  [
    decisionLog,
    "A-16R account verify deploy smoke remains blocked on the same Cloudflare account",
    "decision log verify deploy smoke decision",
  ],
  [
    handoff,
    "A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE_STATUS=BLOCKED_WRONG_CLOUDFLARE_ACCOUNT_TARGET_WORKER_NOT_FOUND",
    "handoff verify deploy smoke status",
  ],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [docPath, doc],
  [routePath, route],
  [servicePath, service],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}\/official-import/i, `${label} must not call official import`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}

rejectPattern(doc + route + service, /canRunOfficialImport:\s*true/, "must not open canRunOfficialImport");
rejectPattern(doc + route + service, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + route + service, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  packagePath,
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "docs/PLAN_A16R_GITHUB_ACTIONS_LINUX_DEPLOY_SMOKE.md",
  "scripts/check-a16r-github-actions-linux-deploy-smoke.cjs",
  "docs/PLAN_A16R_OFFICIAL_IMPORT_GATE_READINESS_DIAGNOSIS.md",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
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
  console.error("A-16R GIA PHA Cloudflare account verify deploy smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R GIA PHA Cloudflare account verify deploy smoke check passed.");
