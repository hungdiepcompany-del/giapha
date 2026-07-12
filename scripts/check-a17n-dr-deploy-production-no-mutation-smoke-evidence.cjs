#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const evidenceDocPath =
  "docs/PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md";
const a17nRDocPath = "docs/PLAN_A17N_R_ADMIN_PARENT_CHILD_RUNTIME_INTEGRATION.md";
const checkerPath =
  "scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs";

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

function rejectActiveObsoleteMarker(content, marker) {
  if (content.includes(marker)) failures.push(`obsolete active marker ${marker}`);
}

const evidenceDoc = read(evidenceDocPath);
const a17nRDoc = read(a17nRDocPath);
const index = read("docs/00_INDEX.md");
const workLog = read("docs/08_AI_WORK_LOG.md");
const decisionLog = read("docs/09_DECISION_LOG.md");
const handoff = read("docs/99_NEXT_AI_HANDOFF.md");
const packageJson = readJson("package.json");

for (const token of [
  "A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED",
  "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED",
  "PUSH_STATUS=PASS",
  "PUSHED_COMMIT=256d746",
  "PUSHED_RUNTIME_COMMIT=256d746",
  "REMOTE_SYNC_AFTER_PUSH=0_0",
  "ORIGIN_MAIN_CONTAINS_256D746=YES",
  "CLOUDFLARE_DEPLOY_STATUS=PASS",
  "DEPLOYED_COMMIT=256d746",
  "PRODUCTION_BASE_URL=https://web-gia-pha.hungdiepcompany.workers.dev",
  "ADMIN_TREE_ROUTE_ACCESSIBLE=YES",
  "AUTHENTICATION_SUCCESS=YES",
  "ADD_FATHER_MODE_ACTIVATED=YES",
  "ADD_MOTHER_MODE_ACTIVATED=YES",
  "ADD_CHILD_MODE_ACTIVATED=YES",
  "ADD_SPOUSE_MODE_ACTIVATED=YES",
  "VIETNAMESE_UI_RENDERED=YES",
  "BROWSER_RUNTIME_ERROR=NO",
  "FORM_SUBMITTED=NO",
  "RELATIONSHIP_ACTION_COMPLETED=NO",
  "RPC_REQUEST_VISIBLE_IN_NETWORK=NO",
  "DATABASE_BASELINE_BEFORE_SMOKE=PASS",
  "ACTIVE_FAMILY_COUNT_BEFORE=74",
  "ACTIVE_PARENT_MEMBERSHIP_COUNT_BEFORE=140",
  "ACTIVE_CHILD_MEMBERSHIP_COUNT_BEFORE=73",
  "TOTAL_FAMILY_ROWS_BEFORE=75",
  "TOTAL_PARENT_MEMBERSHIP_ROWS_BEFORE=142",
  "TOTAL_CHILD_MEMBERSHIP_ROWS_BEFORE=74",
  "IDEMPOTENCY_ROW_COUNT_BEFORE=0",
  "TRANSACTION_EXECUTOR_REVISION_COUNT_BEFORE=0",
  "CANONICAL_KEY_BACKFILL_COUNT_BEFORE=0",
  "OWNER_DECISION_ROW_COUNT_BEFORE=0",
  "RECONCILIATION_BATCH_ROW_COUNT_BEFORE=0",
  "ROLLBACK_MANIFEST_ROW_COUNT_BEFORE=0",
  "BROWSER_NO_MUTATION_SMOKE=PASS",
  "DATABASE_BASELINE_AFTER_SMOKE=PASS",
  "ACTIVE_FAMILY_COUNT_AFTER=74",
  "ACTIVE_PARENT_MEMBERSHIP_COUNT_AFTER=140",
  "ACTIVE_CHILD_MEMBERSHIP_COUNT_AFTER=73",
  "TOTAL_FAMILY_ROWS_AFTER=75",
  "TOTAL_PARENT_MEMBERSHIP_ROWS_AFTER=142",
  "TOTAL_CHILD_MEMBERSHIP_ROWS_AFTER=74",
  "IDEMPOTENCY_ROW_COUNT_AFTER=0",
  "TRANSACTION_EXECUTOR_REVISION_COUNT_AFTER=0",
  "CANONICAL_KEY_BACKFILL_COUNT_AFTER=0",
  "OWNER_DECISION_ROW_COUNT_AFTER=0",
  "RECONCILIATION_BATCH_ROW_COUNT_AFTER=0",
  "ROLLBACK_MANIFEST_ROW_COUNT_AFTER=0",
  "TRANSACTION_EXECUTOR_CALLED=NO",
  "GENEALOGY_ROWS_MODIFIED=NO",
  "PRODUCTION_DATA_DRIFT=NO",
  "RECONCILIATION_EXECUTED=NO",
  "OFFICIAL_IMPORT_RPC_CALLED=NO",
  "RUNTIME_CHANGED=NO",
  "MIGRATION_CREATED=NO",
  "MIGRATION_CHANGED=NO",
  "SQL_EXECUTED=NO",
  "RPC_CALLED=NO",
  "DEPLOY_EXECUTED_BY_THIS_PHASE=NO",
  "PACKAGE_DEPENDENCY_INSTALLED=NO",
  "A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED",
]) {
  requireIncludes(evidenceDoc, token, `evidence token ${token}`);
}

for (const token of [
  "A17N_R_STATUS=PASS_RUNTIME_INTEGRATION_DEPLOYED_AND_NO_MUTATION_SMOKE_VERIFIED",
  "A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED",
  "DEPLOYED_COMMIT=256d746",
  "A17O_READINESS=READY_A17N_DEPLOY_SMOKE_EVIDENCE_RECORDED",
  "NEXT_ACTION=RETRY_A17O_OFFICIAL_IMPORTER_CANONICAL_FAMILY_GROUPING_FIX",
]) {
  requireIncludes(a17nRDoc, token, `A-17N-R updated token ${token}`);
}

for (const [content, token, label] of [
  [index, "PLAN_A17N_DR_DEPLOY_PRODUCTION_NO_MUTATION_SMOKE_EVIDENCE.md", "index A-17N-DR"],
  [workLog, "A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED", "work log A-17N-DR"],
  [decisionLog, "Decision 338 - A-17N-DR records deployed canonical admin no-mutation smoke", "decision A-17N-DR"],
  [handoff, "A17N_DR_STATUS=PASS_DEPLOY_AND_PRODUCTION_NO_MUTATION_SMOKE_RECORDED", "handoff A-17N-DR"],
]) {
  requireIncludes(content, token, label);
}

for (const obsolete of [
  "A17O_READINESS=BLOCKED_A17N_DEPLOY_EVIDENCE_MISSING",
  "A17N_DEPLOY_SMOKE=PENDING",
]) {
  rejectActiveObsoleteMarker([evidenceDoc, a17nRDoc, handoff].join("\n"), obsolete);
}

if (
  packageJson?.scripts?.["check:a17n-dr-deploy-production-no-mutation-smoke-evidence"] !==
  "node scripts/check-a17n-dr-deploy-production-no-mutation-smoke-evidence.cjs"
) {
  failures.push("missing package script check:a17n-dr-deploy-production-no-mutation-smoke-evidence");
}

const originBranches = git(["branch", "-r", "--contains", "256d746"]);
if (!originBranches.includes("origin/main")) {
  failures.push("origin/main does not contain 256d746");
}

const changedFiles = git(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  evidenceDocPath,
  a17nRDocPath,
  checkerPath,
  "package.json",
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a17n-r-admin-parent-child-runtime-integration.cjs",
  "scripts/check-a17n-admin-parent-child-canonical-write-path.cjs",
  "scripts/check-a17n-tx1-admin-canonical-family-transaction-executor-candidate.cjs",
  "scripts/check-a17n-tx2f-post-apply-verifier-active-scope-correction.cjs",
  "scripts/check-a17m-canonical-family-domain-service.cjs",
  "scripts/check-a17a-tree-baseline-evidence.cjs",
  "scripts/check-a17e-family-duplicate-read-only-audit.cjs",
  "scripts/check-a17h-canonical-family-schema-foundation-candidate.cjs",
  "scripts/check-a17i-canonical-family-schema-post-apply-verification.cjs",
  "scripts/check-a16r-import-completed-post-import-verification.cjs",
]);

for (const file of changedFiles) {
  if (/^(app|components|lib|services)\//.test(file)) {
    failures.push(`runtime file changed during A-17N-DR: ${file}`);
  }
  if (/^(db\/migrations|supabase\/migrations)\//.test(file)) {
    failures.push(`migration changed during A-17N-DR: ${file}`);
  }
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected A-17N-DR dirty file: ${file}`);
  }
}

const stagedFiles = git(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (!allowedChangedFiles.has(file)) {
    failures.push(`unexpected staged A-17N-DR file: ${file}`);
  }
}

if (failures.length > 0) {
  console.error("A-17N-DR deploy/no-mutation smoke evidence check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-17N-DR deploy/no-mutation smoke evidence check passed.");
