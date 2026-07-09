#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const docPath =
  "docs/PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md";
const checkerPath =
  "scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const routePath =
  "app/api/admin/import-sessions/[sessionId]/official-import/route.ts";
const packagePath = "package.json";
const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

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
const service = read(servicePath);
const route = read(routePath);
const packageJson = readJson(packagePath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const wrangler = read("wrangler.toml");
const layout = read("app/layout.tsx");

for (const token of [
  "A-16AH-OFFICIAL-IMPORT-RUNTIME-EXECUTION-BRANCH-CANDIDATE",
  `A16AH_TARGET_SESSION_ID=${sessionId}`,
  "A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED",
  "A16AH_BLOCKER=NONE_SOURCE_BRANCH_CANDIDATE_READY_BUT_NOT_EXECUTED_BY_PHASE_BOUNDARY",
  "A16AH_EXECUTION_BRANCH_DEFAULT=DISABLED_UNLESS_A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
  "A16AH_ENV_FLAG=A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED",
  "A16AH_ROUTE_CANDIDATE_FLAG=A16P_OFFICIAL_IMPORT_RUNTIME_CANDIDATE_ENABLED",
  "A16AH_EXECUTOR_CALL_PROOF=MOCKABLE_EXECUTOR_CALLED_EXACTLY_ONCE_ONLY_AFTER_SAME_RUN_GATES",
  "A16AH_APPROVED_TRANSACTION_HELPER=public.a16p_tx_execute_giapha4_official_import",
  "A16AH_RPC_FUNCTION=a16p_tx_execute_giapha4_official_import",
  "A16AH_SAME_RUN_GATE_REQUIRED=YES",
  "A16AH_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16AH_A16R_IMPORT_RETRY_EXECUTED=NO",
  "A16R_IMPORT_RETRY_NEXT=NO",
  "A16AH_DIRECT_MANUAL_RPC_IMPORT_CALLED=NO",
  "A16AH_SQL_RUN=NO",
  "A16AH_DB_PUSH_RUN=NO",
  "A16AH_DEPLOY_RUN=NO",
  "A16AH_RAW_JSON_COMMITTED=NO",
  "A16AH_WRANGLER_TOML_CHANGED=NO",
  "A16AH_APP_LAYOUT_TSX_CHANGED=NO",
]) {
  requireIncludes(doc, token, `doc token ${token}`);
}

for (const [content, token, label] of [
  [service, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_MARKER", "service marker"],
  [service, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENV", "service env token"],
  [service, "OfficialImportTransactionExecutor", "executor type"],
  [service, "executeOfficialImportTransactionWithSupabase", "default executor"],
  [service, "executeOfficialImportRuntimeCandidate", "runtime executor wrapper"],
  [service, "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)", "same-run gate before executor"],
  [service, "const executionResult = await executor({", "single executor call"],
  [service, "executorCallCount: 1", "executor call count one"],
  [service, "executorCallCount: 0", "default call count zero"],
  [service, "p_dry_run_only: false", "real helper branch args"],
  [service, "A16P_TX_TRANSACTION_RPC_FUNCTION_NAME", "rpc function token"],
  [route, "A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "route execution env flag"],
  [route, "process.env.A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED === \"true\"", "route env comparison"],
  [route, "executionBranchEnabled: A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "route passes env gate"],
  [index, "PLAN_A16AH_OFFICIAL_IMPORT_RUNTIME_EXECUTION_BRANCH_CANDIDATE.md", "index entry"],
  [workLog, "A16AH_STATUS=PASS_SOURCE_BRANCH_CANDIDATE_NOT_EXECUTED", "work log status"],
  [decisionLog, "A-16AH adds real runtime execution branch candidate while keeping default execution disabled", "decision log entry"],
  [handoff, "A16AH_EXECUTION_BRANCH_DEFAULT=DISABLED_UNLESS_A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED", "handoff default"],
]) {
  requireIncludes(content, token, label);
}

if (
  packageJson?.scripts?.[
    "check:a16ah-official-import-runtime-execution-branch-candidate"
  ] !==
  "node scripts/check-a16ah-official-import-runtime-execution-branch-candidate.cjs"
) {
  failures.push(
    "missing package script check:a16ah-official-import-runtime-execution-branch-candidate",
  );
}

const executorCallMatches = service.match(/await executor\s*\(/g) ?? [];
if (executorCallMatches.length !== 1) {
  failures.push(
    `expected exactly one mockable executor call, found ${executorCallMatches.length}`,
  );
}

const rpcCallMatches = service.match(/\.rpc\s*\(/g) ?? [];
if (rpcCallMatches.length !== 1) {
  failures.push(`expected exactly one runtime RPC helper call branch, found ${rpcCallMatches.length}`);
}

const gateIndex = service.indexOf(
  "if (!candidate.canRunOfficialImport || params.executionBranchEnabled !== true)",
);
const executorIndex = service.indexOf("const executionResult = await executor({");
if (gateIndex < 0 || executorIndex < 0 || gateIndex > executorIndex) {
  failures.push("executor call must appear after same-run gate check");
}

rejectPattern(route, /A16AH_OFFICIAL_IMPORT_EXECUTION_BRANCH_ENABLED\s*=\s*true/i, "route must not hardcode execution branch true");
rejectPattern(doc, /A16R_IMPORT_RETRY_NEXT=YES/i, "A-16R retry must remain NO");
rejectPattern(doc, /A16AH_OFFICIAL_IMPORT_POST_CALLED=YES/i, "A-16AH must not call official import POST");
rejectPattern(doc + index + workLog + decisionLog + handoff, /(?:eyJ[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]+)/i, "secret-like token");
rejectPattern(wrangler, /A16AH|A16R_IMPORT_RETRY/i, "wrangler config must not change for A-16AH");
rejectPattern(layout, /A16AH|official-import/i, "layout must not change for A-16AH");

for (const [label, content] of [
  [servicePath, service],
  [routePath, route],
]) {
  rejectPattern(
    content,
    /\.from\(\s*["'](people|relationships|families|family_parents|family_children|couple_relationships|tree_layouts?|revisions|profiles)["']\s*\)[\s\S]{0,240}\.(insert|update|delete|upsert)\s*\(/i,
    `${label} must not write real genealogy tables directly`,
  );
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  docPath,
  checkerPath,
  "docs/PLAN_A16AL_OFFICIAL_IMPORT_RUNTIME_MARKER_ALIGNMENT.md",
  "scripts/check-a16al-official-import-runtime-marker-alignment.cjs",
  "docs/PLAN_A16AM_OWNER_SAME_RUN_OFFICIAL_IMPORT_POST_CONFIRMATION.md",
  "scripts/check-a16am-owner-same-run-official-import-post-confirmation.cjs",
  "scripts/check-a16aa-relationship-audit-warning-review-import-retry-readiness.cjs",
  "scripts/check-a16ab-import-retry-preflight-approval-gate.cjs",
  "scripts/check-a16x2-correct-a16o-full-relationship-audit-export-shape-verification.cjs",
  "scripts/check-a16r-official-import-gate-readiness-diagnosis.cjs",
  "docs/PLAN_A16AK_OFFICIAL_IMPORT_SESSION_DUPLICATE_READINESS.md",
  "scripts/check-a16ak-official-import-session-duplicate-readiness.cjs",
  "scripts/check-a16r-fix-official-import-session-selection-mismatch.cjs",
  "scripts/check-a16q-dup-decision-verify.cjs",
  "app/(admin)/admin/exports/import/page.tsx",
  servicePath,
  routePath,
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16ae-runtime-official-import-enablement-candidate.cjs",
  "scripts/check-a16af-runtime-import-enablement-candidate-production-smoke.cjs",
  "scripts/check-a16ag-a16r-official-import-retry-execution.cjs",
  "scripts/check-a16v-apply-verify.cjs",
  "scripts/check-a16ac-import-retry-execution-final-gate.cjs",
  "scripts/check-a16ad-runtime-official-import-enablement-blocker-diagnosis.cjs",
  "scripts/check-a16t-apply-verify.cjs",
  "scripts/check-a16u-locked-runtime-wiring.cjs",
  "scripts/check-a16u-official-import-transaction-branch.cjs",
  "scripts/check-a16v-official-import-real-transaction-execution-branch.cjs",
  "scripts/check-a16u-verify-runbook.cjs",
  "scripts/check-a16v-a16r-execution-retry-requirements.cjs",
  "scripts/check-a16r-runtime-execution-enablement-gate.cjs",
  "scripts/check-a16r-runtime-execution-enablement-owner-review.cjs",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file.startsWith(".tmp/")) failures.push(`.tmp file must not be committed ${file}`);
  if (file !== packagePath && /\.(json|xlsx|xls|csv|zip)$/i.test(file)) {
    failures.push(`raw evidence/data file must not be committed ${file}`);
  }
  if (file === "wrangler.toml" || file === "app/layout.tsx") {
    failures.push(`forbidden file changed ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations|db\/checks)\//.test(file)) {
    failures.push(`forbidden SQL/check file ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected staged file ${file}`);
}

const changedPatch = git([
  "diff",
  "--",
  ...changedFiles.filter((file) => allowedChangedFiles.has(file)),
]);
for (const pattern of [
  /\bsupabase\s+db\s+push\b/i,
  /\bwrangler\s+deploy\s+--/i,
]) {
  rejectPattern(changedPatch, pattern, `changed patch ${pattern}`);
}

if (failures.length > 0) {
  console.error("A-16AH official import runtime execution branch candidate check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16AH official import runtime execution branch candidate check passed.");
