const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath = "docs/PLAN_A16U_VERIFY_RUNBOOK.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath = "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";

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

function requireIncludes(content, token, label = token) {
  if (!content.includes(token)) failures.push(`missing ${label}`);
}

function rejectPattern(content, pattern, label = String(pattern)) {
  if (pattern.test(content)) failures.push(`forbidden ${label}`);
}

const doc = readFile(docPath);
const service = readFile(servicePath);
const route = readFile(routePath);
const packageJson = readJson(packagePath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16U-VERIFY-RUNBOOK",
  "A16U_VERIFY_RUNBOOK_STATUS=READY",
  "A16U_RUNBOOK_A16T_APPLY_VERIFY_PASS_REQUIRED=YES",
  "A16U_RUNBOOK_A16U_BRANCH_READY_REQUIRED=YES",
  "A16U_RUNBOOK_SESSION_PREFLIGHT_PASS_REQUIRED=YES",
  "A16U_RUNBOOK_SESSION_ID_REQUIRED=2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16U_RUNBOOK_MARKER_REQUIRED=APPROVE_A16R_RUN_OFFICIAL_IMPORT_FOR_SESSION_2af4bfb6-a20e-453e-9804-1b8c0afbdd68",
  "A16U_RUNBOOK_STAGING_PEOPLE=102",
  "A16U_RUNBOOK_STAGING_RELATIONSHIPS=134",
  "A16U_RUNBOOK_VALIDATION_ERRORS=0",
  "A16U_RUNBOOK_DRY_RUN_BLOCKERS=0",
  "A16U_RUNBOOK_DUPLICATE_UNRESOLVED=0",
  "A16U_RUNBOOK_DUPLICATE_NEEDS_REVIEW=0",
  "A16U_RUNBOOK_DUPLICATE_CREATE_NEW=8",
  "official_import_batches",
  "official_import_rollback_manifests",
  "idempotency key prevents rerun",
  "A16U_RUNBOOK_RPC_CALLED=NO",
  "A16U_RUNBOOK_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16U_RUNBOOK_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
  "A16U_RUNBOOK_DB_PUSH_STATUS=NOT_RUN",
  "A16U_RUNBOOK_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16U_RUNBOOK_SEED_STATUS=NOT_RUN",
  "A16U_RUNBOOK_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16U_RUNBOOK_PUSH_STATUS=NOT_PUSHED",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const token of [
  "A16U_VERIFY_RUNBOOK_MARKER",
  "A16U_REQUIRED_A16R_RETRY_MARKER",
  "A16U_REQUIRED_SESSION_ID",
  "canRunOfficialImport: false",
]) {
  requireIncludes(service, token, `service token ${token}`);
}

if (
  packageJson?.scripts?.["check:a16u-verify-runbook"] !==
  "node scripts/check-a16u-verify-runbook.cjs"
) {
  failures.push("missing package script check:a16u-verify-runbook");
}

for (const [content, token, label] of [
  [index, "PLAN_A16U_VERIFY_RUNBOOK.md", "index A-16U runbook entry"],
  [workLog, "A16U_VERIFY_RUNBOOK_STATUS=READY", "work log A-16U runbook status"],
  [decisionLog, "Decision 240", "decision log A-16U entry"],
  [handoff, "A16U_VERIFY_RUNBOOK_STATUS=READY", "handoff A-16U runbook status"],
]) {
  requireIncludes(content, token, label);
}

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${label} must not call RPC`);
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables`,
  );
}
rejectPattern(doc + service + route, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  "docs/PLAN_A16U_OFFICIAL_IMPORT_TRANSACTION_BRANCH.md",
  "docs/PLAN_A16U_LOCKED_RUNTIME_WIRING.md",
  docPath,
  "docs/PLAN_A16U_PRODUCTION_IMPORT_UI_DEPLOY_SMOKE.md",
  "docs/PLAN_A16U_PRODUCTION_IMPORT_UI_POST_DEPLOY_SMOKE.md",
  "docs/PLAN_A16R_RUN_RETRY_OFFICIAL_IMPORT_BUNDLE.md",
  "docs/PLAN_A16R_RUN_RETRY_POST_IMPORT_VERIFY.md",
  "docs/PLAN_A16R_AFTER_A16V_OFFICIAL_IMPORT_EXECUTION_BUNDLE.md",
  "docs/PLAN_A16R_AFTER_A16V_POST_IMPORT_VERIFY.md",
  "docs/PLAN_A16V_PRODUCTION_RUNTIME_EVIDENCE_RECONCILIATION.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_GATE.md",
  "docs/PLAN_A16R_RUNTIME_EXECUTION_ENABLEMENT_OWNER_REVIEW.md",
  "docs/PLAN_A16V_OFFICIAL_IMPORT_REAL_TRANSACTION_EXECUTION_BRANCH.md",
  "docs/PLAN_A16V_SQL_APPLY_VERIFY_RUNBOOK.md",
  "docs/PLAN_A16V_A16R_EXECUTION_RETRY_REQUIREMENTS.md",
  "docs/PLAN_A16V_MARKER_VERIFICATION_FIX.md",
  "docs/PLAN_A16V_APPLY_VERIFY.md",
  "docs/PLAN_A16T_APPLY_VERIFY.md",
  servicePath,
  routePath,
  "components/imports/import-session-manifest-panel.tsx",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16t-grant-rls-hardening-fix.cjs",
  "scripts/check-a16t-official-import-audit-rollback-idempotency-schema.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16u-production-import-ui-deploy-smoke.cjs",
  "scripts/check-a16u-production-import-ui-post-deploy-smoke.cjs",
  "scripts/check-a16r-run-retry-official-import-bundle.cjs",
  "scripts/check-a16r-run-retry-post-import-verify.cjs",
  "scripts/check-a16r-after-a16v-official-import-execution-bundle.cjs",
  "scripts/check-a16r-after-a16v-post-import-verify.cjs",
  "scripts/check-a16v-production-runtime-evidence-reconciliation.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16v-sql-apply-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16v-marker-verification-fix.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "db/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "supabase/migrations/20260703_0016_a16v_official_import_real_transaction_execution_branch_candidate.sql",
  "db/checks/20260703_check_a16v_official_import_real_transaction_execution_branch.sql",
  "db/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  "supabase/migrations/20260703_0017_a16v_marker_verification_fix_candidate.sql",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "CHECK_CLOUDFLARE_ACCOUNT.bat",
  "GUARD.bat",
  "GIA_PHA_GITHUB_MENU.bat",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) failures.push(".env.local must not change");
  if (file.startsWith("supabase/.temp/")) failures.push(`supabase temp must not change ${file}`);
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`spreadsheet/csv must not change ${file}`);
}

if (failures.length > 0) {
  console.error("A-16U verify runbook check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16U verify runbook check passed.");
