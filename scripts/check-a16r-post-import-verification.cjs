const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = process.cwd();
const failures = [];

const sessionId = "2af4bfb6-a20e-453e-9804-1b8c0afbdd68";

const postDocPath = "docs/PLAN_A16R_POST_IMPORT_VERIFICATION.md";
const runDocPath = "docs/PLAN_A16R_RUN_OFFICIAL_IMPORT.md";
const packagePath = "package.json";
const servicePath = "lib/import/giapha4/official-import-service.ts";
const sqlPath =
  "db/migrations/20260701_0012_a16p_tx_official_import_transaction_helper_candidate.sql";

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

const postDoc = readFile(postDocPath);
const runDoc = readFile(runDocPath);
const packageJson = readJson(packagePath);
const service = readFile(servicePath);
const sql = readFile(sqlPath);
const index = readFile("docs/00_INDEX.md");
const workLog = readFile("docs/08_AI_WORK_LOG.md");
const decisionLog = readFile("docs/09_DECISION_LOG.md");
const handoff = readFile("docs/99_NEXT_AI_HANDOFF.md");

for (const token of [
  "A-16R-POST-IMPORT-VERIFICATION",
  "A16R_POST_IMPORT_VERIFICATION_STATUS=NOT_RUN_IMPORT_NOT_EXECUTED",
  sessionId,
  "A16R_RUN_STATUS=BLOCKED_REAL_TRANSACTION_EXECUTION_BRANCH_NOT_READY",
  "A16R_RUN_TRANSACTION_BRANCH_READY=NO",
  "A16R_RUN_OFFICIAL_IMPORT_POST_CALLED=NO",
  "A16R_RUN_RPC_CALLED=NO",
  "A16R_POST_IMPORT_STAGING_PEOPLE_COUNT=102",
  "A16R_POST_IMPORT_STAGING_RELATIONSHIP_COUNT=134",
  "A16R_POST_IMPORT_VALIDATION_ERROR_COUNT=0",
  "A16R_POST_IMPORT_DRY_RUN_BLOCKER_COUNT=0",
  "A16R_POST_IMPORT_DUPLICATE_UNRESOLVED_COUNT=0",
  "A16R_POST_IMPORT_DUPLICATE_NEEDS_REVIEW_COUNT=0",
  "A16R_POST_IMPORT_DUPLICATE_CREATE_NEW_COUNT=8",
  "A16R_POST_IMPORT_CREATED_PEOPLE_COUNT=0",
  "A16R_POST_IMPORT_CREATED_RELATIONSHIP_COUNT=0",
  "A16R_POST_IMPORT_AUDIT_REVISION_EVIDENCE=NONE_IMPORT_NOT_EXECUTED",
  "A16R_POST_IMPORT_ROLLBACK_EVIDENCE=NONE_IMPORT_NOT_EXECUTED",
  "A16R_POST_IMPORT_COMPLETION_MARKER=NONE_IMPORT_NOT_EXECUTED",
  "A16R_POST_IMPORT_IDEMPOTENCY_RETRY_PROTECTION=NOT_PROVEN_REAL_BRANCH_MISSING",
  "A16R_POST_IMPORT_BUTTON_STATE=DISABLED",
  "A16R_POST_IMPORT_CAN_RUN_OFFICIAL_IMPORT=false",
  "A16R_POST_IMPORT_DB_PUSH_STATUS=NOT_RUN",
  "A16R_POST_IMPORT_MIGRATION_REPAIR_STATUS=NOT_RUN",
  "A16R_POST_IMPORT_SEED_STATUS=NOT_RUN",
  "A16R_POST_IMPORT_DEPLOY_STATUS=NOT_DEPLOYED",
  "A16R_POST_IMPORT_PUSH_STATUS=NOT_PUSHED",
  "A16R_POST_IMPORT_REAL_GENEALOGY_WRITE_STATUS=NO_WRITE",
]) {
  requireIncludes(postDoc, token, `post doc token ${token}`);
}

requireIncludes(runDoc, "A16R_RUN_STATUS=BLOCKED_REAL_TRANSACTION_EXECUTION_BRANCH_NOT_READY", "run doc blocked status");

if (
  packageJson?.scripts?.["check:a16r-post-import-verification"] !==
  "node scripts/check-a16r-post-import-verification.cjs"
) {
  failures.push("missing package script check:a16r-post-import-verification");
}

for (const [content, token, label] of [
  [index, "PLAN_A16R_POST_IMPORT_VERIFICATION.md", "index post verification entry"],
  [workLog, "A16R_POST_IMPORT_VERIFICATION_STATUS=NOT_RUN_IMPORT_NOT_EXECUTED", "work log post status"],
  [decisionLog, "Decision 233", "decision log A-16R run entry"],
  [handoff, "A16R_POST_IMPORT_VERIFICATION_STATUS=NOT_RUN_IMPORT_NOT_EXECUTED", "handoff post status"],
]) {
  requireIncludes(content, token, label);
}

for (const token of [
  "status: \"BLOCKED\"",
  "canRunOfficialImport: false",
  "importedPeopleCount: 0",
  "importedRelationshipCount: 0",
]) {
  requireIncludes(service, token, `service blocked token ${token}`);
}

for (const token of [
  "REAL_EXECUTION_BRANCH_NOT_OPEN_IN_A16P_TX",
  "created_people_count', 0",
  "created_relationship_count', 0",
]) {
  requireIncludes(sql, token, `SQL blocked token ${token}`);
}

for (const [relativePath, content] of [
  ["scripts/check-a16r-run-official-import.cjs", readFile("scripts/check-a16r-run-official-import.cjs")],
  ["scripts/check-a16r-post-import-verification.cjs", readFile("scripts/check-a16r-post-import-verification.cjs")],
]) {
  rejectPattern(content, /\.rpc\s*\(/i, `${relativePath} must not call RPC`);
  rejectPattern(content, /fetch\s*\([\s\S]{0,240}official-import/i, `${relativePath} must not POST official import`);
  rejectPattern(content, /supabase\s+db\s+push/i, `${relativePath} must not run db push`);
}

const changedFiles = gitOutput(["status", "--porcelain", "--untracked-files=all"])
  .split(/\r?\n/)
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const allowedChangedFiles = new Set([
  runDocPath,
  postDocPath,
  "scripts/check-a16r-run-official-import.cjs",
  "scripts/check-a16r-post-import-verification.cjs",
  packagePath,
  "docs/00_INDEX.md",
  "docs/08_AI_WORK_LOG.md",
  "docs/09_DECISION_LOG.md",
  "docs/99_NEXT_AI_HANDOFF.md",
  "scripts/check-a16q-dup-decision-verify.cjs",
  "scripts/check-a16r-preflight-bundle.cjs",
  "scripts/check-a16r-official-import-runbook.cjs",
  "scripts/check-a16r-session-approval-gate.cjs",
  "docs/PLAN_A16S_OFFICIAL_IMPORT_TRANSACTION_EXECUTION_BRANCH.md",
  "docs/PLAN_A16S_TRANSACTION_AUDIT_ROLLBACK_IDEMPOTENCY_CONTRACT.md",
  "docs/PLAN_A16S_SQL_APPLY_VERIFY_RUNBOOK.md",
  "scripts/check-a16s-official-import-transaction-execution-branch.cjs",
  "scripts/check-a16s-transaction-audit-rollback-idempotency-contract.cjs",
  "scripts/check-a16s-sql-apply-verify-runbook.cjs",
  "lib/import/giapha4/official-import-service.ts",
]);

for (const file of changedFiles) {
  if (!allowedChangedFiles.has(file)) failures.push(`unexpected changed file ${file}`);
  if (file === ".env.local" || file.endsWith(".env.local")) {
    failures.push(".env.local must not be changed");
  }
  if (file.startsWith("db/migrations/") || file.startsWith("supabase/migrations/")) {
    failures.push(`migration must not change ${file}`);
  }
  if (file.startsWith("db/checks/")) failures.push(`SQL check must not change ${file}`);
  if (file.startsWith("supabase/.temp/")) {
    failures.push(`supabase temp must not change ${file}`);
  }
  if (/\.(xls|xlsx|csv)$/i.test(file)) {
    failures.push(`spreadsheet/csv must not be changed ${file}`);
  }
}

const stagedFiles = gitOutput(["diff", "--cached", "--name-only"])
  .split(/\r?\n/)
  .filter(Boolean);
for (const file of stagedFiles) {
  if (/\.(xls|xlsx|csv)$/i.test(file)) failures.push(`staged data file ${file}`);
}

if (failures.length > 0) {
  console.error("A-16R-POST-IMPORT-VERIFICATION check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("A-16R-POST-IMPORT-VERIFICATION check passed.");
