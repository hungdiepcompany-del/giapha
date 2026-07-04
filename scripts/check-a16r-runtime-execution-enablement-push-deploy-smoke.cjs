const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md";
const ownerReviewDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md";
const gateDocPath = "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const panelPath = "components/imports/import-session-manifest-panel.tsx";
const wranglerPath = "wrangler.toml";
const packagePath = "package.json";

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
const ownerReviewDoc = read(ownerReviewDocPath);
const gateDoc = read(gateDocPath);
const service = read(servicePath);
const route = read(routePath);
const panel = read(panelPath);
const wrangler = read(wranglerPath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-RUNTIME-EXECUTION-ENABLEMENT-PUSH-DEPLOY-SMOKE",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE_STATUS=BLOCKED_DEPLOY_TARGET_MISMATCH",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_PREFLIGHT_STATUS=PASS_WITH_REMOTE_URL_ALIAS_NOTE",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_STATUS=PASS_PUSHED_TO_ORIGIN_MAIN",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_DEPLOY_STATUS=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PRODUCTION_SMOKE_STATUS=PASS_EXISTING_PUBLIC_GET_ONLY_NOT_POST_DEPLOY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_A16R_RETRY_NOW=NO",
  "git@github-giapha:hungdiepcompany-del/giapha.git",
  "https://github.com/hungdiepcompany-del/giapha.git",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_REMOTE_URL_NOTE=SSH_ALIAS_MATCHES_REPO_SLUG_NOT_LITERAL_HTTPS",
  "70f7df2",
  "c3ab5f78c64455e30c0bd649b020a5b0b79ba3a7",
  "132160f3f4610b5a2c0593dafbca933f5a2bb1ab",
  "55d137c893104c30f7fa738b6be5b0294821dac1",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_BUILD_STATUS=PASS_CLEAN_MIRROR_SOURCE_BUILD_CHECKOUT_ARTIFACT_ACL_BLOCKED",
  "hung.pham@longthaisteel.com",
  "dec1eb5cfb3f4b32956b1aff723e5ace",
  "web-gia-pha",
  "This Worker does not exist on your account.",
  "bom`, `hrsync`, `san-xuat-lt`, `san-xuat-lt-google-drive-service`, `sx",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_DEPLOY_RUN=NO_TARGET_MISMATCH",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_POST_DEPLOY_SMOKE_STATUS=NOT_RUN_DEPLOY_BLOCKED",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_EXISTING_PRODUCTION_GET_SMOKE_STATUS=PASS_PUBLIC_GET_200",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PRODUCTION_CAN_RUN_OFFICIAL_IMPORT=UNKNOWN_DEPLOY_BLOCKED",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_PRODUCTION_OFFICIAL_IMPORT_BUTTON=UNKNOWN_DEPLOY_BLOCKED",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_BLOCKER=BLOCKED_TARGET_WORKER_NOT_FOUND_IN_CURRENT_CLOUDFLARE_ACCOUNT",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_A16R_IMPORT_MAY_BE_RETRIED_NEXT=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_POST_OFFICIAL_IMPORT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_RPC_DIRECT_CALLED=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_REAL_GENEALOGY_WRITE=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_SQL_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_DB_PUSH_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_MIGRATION_REPAIR_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_SEED_RUN=NO",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_DEPLOY_RUN=NO",
  "No POST `/official-import`.",
  "No direct RPC call.",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW_STATUS=PASS_MARKER_PRESENT_VALID_BUT_STILL_FAIL_CLOSED",
]) {
  requireIncludes(ownerReviewDoc, token, `owner review doc token ${token}`);
}

for (const token of [
  "A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE_STATUS=READY_FAIL_CLOSED",
  "A16R_RUNTIME_EXECUTION_CAN_RUN_OFFICIAL_IMPORT=false",
]) {
  requireIncludes(gateDoc, token, `gate doc token ${token}`);
}

requireIncludes(wrangler, 'name = "web-gia-pha"', "wrangler target worker name");

for (const token of [
  "canRunOfficialImport: false",
  "runtimeExecutionEnablementGate",
  "APPROVE_A16R_RUNTIME_EXECUTION_AFTER_A16V_VERIFY",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

for (const token of [
  "canRunOfficialImport: false",
  "confirmRuntimeExecutionEnablementMarker",
]) {
  requireIncludes(route, token, `route token ${token}`);
}

for (const token of ["disabled", "aria-disabled=\"true\""]) {
  requireIncludes(panel, token, `panel token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16r-runtime-execution-enablement-push-deploy-smoke"] !==
  "node scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs"
) {
  failures.push("missing package script check:a16r-runtime-execution-enablement-push-deploy-smoke");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE.md", "index push deploy smoke entry"],
  [workLog, "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE_STATUS=BLOCKED_DEPLOY_TARGET_MISMATCH", "work log push deploy status"],
  [decisionLog, "A-16R push succeeds but deploy blocks on Cloudflare target mismatch", "decision log push deploy decision"],
  [handoff, "A16R_RUNTIME_EXECUTION_ENABLEMENT_PUSH_DEPLOY_SMOKE_STATUS=BLOCKED_DEPLOY_TARGET_MISMATCH", "handoff push deploy status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [docPath, doc],
  [servicePath, service],
  [routePath, route],
  [panelPath, panel],
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

rejectPattern(doc + service + route + panel, /SUPABASE_SERVICE_ROLE_KEY\s*=/i, "secret assignment");
rejectPattern(doc + service + route + panel, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_RECOVERY.md",
  "docs/PLAN_A16R_GIAPHA_CLOUDFLARE_ACCOUNT_VERIFY_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_GIAPHA_CORRECT_ACCOUNT_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_POST_DEPLOY_HTTP500_ROOT_CAUSE.md",
  "docs/PLAN_A16R_OPENNEXT_CLOUDFLARE_DEPLOY_BUNDLE_FIX_CANDIDATE.md",
  packagePath,
  "scripts/check-a16r-post-deploy-http500-root-cause.cjs",
  "scripts/check-a16r-opennext-cloudflare-deploy-bundle-fix-candidate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-push-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-recovery.cjs",
  "scripts/check-a16r-giapha-cloudflare-account-verify-deploy-smoke.cjs",
  "scripts/check-a16r-giapha-correct-account-deploy-smoke.cjs",
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
  if (["CHECK_CLOUDFLARE_ACCOUNT.bat", "GUARD.bat", "GIA_PHA_GITHUB_MENU.bat"].includes(file)) {
    failures.push(`forbidden staged outside-scope file ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-16R runtime execution enablement push deploy smoke check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R runtime execution enablement push deploy smoke check passed.");
